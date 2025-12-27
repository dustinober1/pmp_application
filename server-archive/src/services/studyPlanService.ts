import { prisma } from "./database";
import { ErrorFactory } from "../utils/AppError";

type DomainWeight = {
  id: string;
  name: string;
  weight: number;
};

type GeneratedTask = {
  date: Date;
  domainId: string;
  domainName: string;
  estimatedMinutes: number;
};

type PlanStatus = "on_track" | "behind" | "ahead";

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const determinePlanStatus = (
  tasks: { isCompleted: boolean; date: Date }[],
): PlanStatus => {
  const today = startOfDay(new Date());
  const expectedCompleted = tasks.filter(
    (t) => startOfDay(t.date) <= today,
  ).length;
  const actualCompleted = tasks.filter((t) => t.isCompleted).length;

  if (actualCompleted > expectedCompleted) {
    return "ahead";
  }
  if (actualCompleted < expectedCompleted) {
    return "behind";
  }
  return "on_track";
};

const redistributeRemainingTasks = async (
  tasks: { id: string; isCompleted: boolean; date: Date }[],
  targetExamDate: Date,
) => {
  const today = startOfDay(new Date());
  const remaining = tasks.filter((t) => !t.isCompleted);

  if (remaining.length === 0) {
    return;
  }

  const daysLeft = Math.max(
    1,
    Math.ceil(
      (startOfDay(targetExamDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const updates = remaining.map((task, index) => {
    const dayOffset = Math.floor(
      index / Math.ceil(remaining.length / daysLeft),
    );
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + dayOffset);
    return prisma.studyTask.update({
      where: { id: task.id },
      data: { date: newDate },
    });
  });

  await prisma.$transaction(updates);
};

function normalizeWeights(
  weights: {
    id: string;
    name: string;
    score: number;
    weightPercentage: number;
  }[],
): DomainWeight[] {
  const adjusted = weights.map((domain) => {
    const weaknessFactor = 1 + (100 - domain.score) / 100; // Weigh weaker domains higher
    return {
      id: domain.id,
      name: domain.name,
      weight: domain.weightPercentage * weaknessFactor,
    };
  });

  const total = adjusted.reduce((sum, d) => sum + d.weight, 0);

  if (total === 0) {
    // Fallback to equal weights if somehow zero
    const equalWeight = 1 / adjusted.length;
    return adjusted.map((d) => ({ ...d, weight: equalWeight }));
  }

  return adjusted.map((d) => ({ ...d, weight: d.weight / total }));
}

function generateDailyTasks(
  date: Date,
  domainWeights: DomainWeight[],
  dailyMinutes: number,
): GeneratedTask[] {
  if (domainWeights.length === 0) {
    return [];
  }

  const allocations = domainWeights.map((d) => ({
    ...d,
    minutes: Math.max(20, Math.round(dailyMinutes * d.weight)),
  }));

  // Adjust for rounding differences
  const allocatedTotal = allocations.reduce((sum, d) => sum + d.minutes, 0);
  const diff = dailyMinutes - allocatedTotal;
  if (diff !== 0) {
    allocations[0].minutes += diff;
  }

  return allocations.map((d) => ({
    date,
    domainId: d.id,
    domainName: d.name,
    estimatedMinutes: Math.max(15, d.minutes),
  }));
}

async function getDomainWeightsForUser(
  userId: string,
): Promise<DomainWeight[]> {
  const [domains, profile] = await Promise.all([
    prisma.domain.findMany({
      select: { id: true, name: true, weightPercentage: true },
      orderBy: { weightPercentage: "desc" },
    }),
    prisma.learningProfile.findUnique({
      where: { userId },
      include: { domainMasteries: true },
    }),
  ]);

  const masteryMap = new Map<string, number>();
  profile?.domainMasteries.forEach((dm) =>
    masteryMap.set(dm.domainId, dm.score),
  );

  const weightedDomains = domains.map((domain) => ({
    id: domain.id,
    name: domain.name,
    weightPercentage: domain.weightPercentage,
    score: masteryMap.get(domain.id) ?? 50,
  }));

  return normalizeWeights(weightedDomains);
}

export async function createStudyPlanForUser(params: {
  userId: string;
  targetExamDate: Date;
  hoursPerDay: number;
}) {
  const { userId, targetExamDate, hoursPerDay } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(targetExamDate);
  examDate.setHours(0, 0, 0, 0);

  const diffMs = examDate.getTime() - today.getTime();
  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) {
    throw ErrorFactory.badRequest("Target exam date must be in the future");
  }

  const domainWeights = await getDomainWeightsForUser(userId);
  const dailyMinutes = Math.round(hoursPerDay * 60);

  const tasks: GeneratedTask[] = [];
  for (let i = 0; i < totalDays; i++) {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + i);
    const dayTasks = generateDailyTasks(taskDate, domainWeights, dailyMinutes);
    tasks.push(...dayTasks);
  }

  return prisma.$transaction(async (tx) => {
    // Archive existing active plan
    await tx.studyPlan.updateMany({
      where: { userId, status: "active" },
      data: { status: "archived" },
    });

    const plan = await tx.studyPlan.create({
      data: {
        userId,
        targetExamDate: examDate,
        hoursPerDay,
        status: "active",
        progressStatus: "on_track",
        tasks: {
          create: tasks.map((task) => ({
            date: task.date,
            type: "study",
            description: `Study ${task.domainName} domain`,
            estimatedMinutes: task.estimatedMinutes,
            domainFocus: task.domainId,
          })),
        },
      },
      include: {
        tasks: {
          orderBy: { date: "asc" },
        },
      },
    });

    return plan;
  });
}

export async function getActiveStudyPlan(userId: string) {
  return prisma.studyPlan.findFirst({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
    include: { tasks: { orderBy: { date: "asc" } } },
  });
}

export async function updateStudyPlanForUser(params: {
  userId: string;
  planId: string;
  targetExamDate?: Date;
  hoursPerDay?: number;
  status?: string;
  progressStatus?: string;
}) {
  const {
    userId,
    planId,
    targetExamDate,
    hoursPerDay,
    status,
    progressStatus,
  } = params;

  const existing = await prisma.studyPlan.findUnique({
    where: { id: planId },
    include: { tasks: true },
  });

  if (!existing || existing.userId !== userId) {
    throw ErrorFactory.notFound("Study plan not found");
  }

  const shouldRegenerate =
    targetExamDate !== undefined || hoursPerDay !== undefined;

  const data: Record<string, unknown> = {};
  if (targetExamDate) {
    data.targetExamDate = targetExamDate;
  }
  if (hoursPerDay !== undefined) {
    data.hoursPerDay = hoursPerDay;
  }
  if (status) {
    data.status = status;
  }
  if (progressStatus) {
    data.progressStatus = progressStatus;
  }

  if (!shouldRegenerate) {
    return prisma.studyPlan.update({
      where: { id: planId },
      data,
      include: { tasks: { orderBy: { date: "asc" } } },
    });
  }

  const examDate = targetExamDate
    ? new Date(targetExamDate)
    : existing.targetExamDate;
  examDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = examDate.getTime() - today.getTime();
  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) {
    throw ErrorFactory.badRequest("Target exam date must be in the future");
  }

  const domainWeights = await getDomainWeightsForUser(userId);
  const minutes = Math.round((hoursPerDay ?? existing.hoursPerDay) * 60);

  const tasks: GeneratedTask[] = [];
  for (let i = 0; i < totalDays; i++) {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + i);
    tasks.push(...generateDailyTasks(taskDate, domainWeights, minutes));
  }

  return prisma.$transaction(async (tx) => {
    await tx.studyTask.deleteMany({ where: { planId } });

    const plan = await tx.studyPlan.update({
      where: { id: planId },
      data: {
        ...data,
        tasks: {
          create: tasks.map((task) => ({
            date: task.date,
            type: "study",
            description: `Study ${task.domainName} domain`,
            estimatedMinutes: task.estimatedMinutes,
            domainFocus: task.domainId,
          })),
        },
      },
      include: { tasks: { orderBy: { date: "asc" } } },
    });

    return plan;
  });
}

export async function getStudyPlanTasksForUser(userId: string, planId: string) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });

  if (!plan || plan.userId !== userId) {
    throw ErrorFactory.notFound("Study plan not found");
  }

  return prisma.studyTask.findMany({
    where: { planId },
    orderBy: { date: "asc" },
  });
}

export async function completeStudyTaskForUser(params: {
  userId: string;
  taskId: string;
}) {
  const { userId, taskId } = params;

  const task = await prisma.studyTask.findUnique({
    where: { id: taskId },
    include: { plan: true },
  });

  if (!task) {
    throw ErrorFactory.notFound("Study task not found");
  }

  if (task.plan.userId !== userId) {
    throw ErrorFactory.forbidden("You do not have access to this task");
  }

  if (!task.isCompleted) {
    await prisma.studyTask.update({
      where: { id: taskId },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }

  const planTasks = await prisma.studyTask.findMany({
    where: { planId: task.planId },
    select: { id: true, isCompleted: true, date: true },
    orderBy: { date: "asc" },
  });

  const newStatus = determinePlanStatus(planTasks);

  if (newStatus === "behind") {
    await redistributeRemainingTasks(planTasks, task.plan.targetExamDate);
  }

  await prisma.studyPlan.update({
    where: { id: task.planId },
    data: { progressStatus: newStatus },
  });

  return {
    message: "Task completed",
    planStatus: newStatus,
    recommendations:
      newStatus === "behind"
        ? "Schedule adjusted to distribute remaining tasks before your exam date. Consider adding a short daily catch-up session."
        : newStatus === "ahead"
          ? "You are ahead of schedule. Maintain consistency to keep your buffer."
          : "You are on track. Keep going!",
  };
}
