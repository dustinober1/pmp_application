// Mock Prisma client
const mockPrisma = {
  domain: {
    findMany: jest.fn(),
  },
  learningProfile: {
    findUnique: jest.fn(),
  },
  studyPlan: {
    updateMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  studyTask: {
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: (fn: any) =>
    fn({
      studyPlan: mockPrisma.studyPlan,
      studyTask: mockPrisma.studyTask,
    }),
};

jest.mock("../../src/services/database", () => ({
  prisma: mockPrisma,
}));

import {
  createStudyPlanForUser,
  getActiveStudyPlan,
  updateStudyPlanForUser,
} from "../../src/services/studyPlanService";

describe("studyPlanService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a study plan and generates tasks weighted by domains", async () => {
    mockPrisma.domain.findMany.mockResolvedValue([
      { id: "d1", name: "People", weightPercentage: 42 },
      { id: "d2", name: "Process", weightPercentage: 50 },
      { id: "d3", name: "Business", weightPercentage: 8 },
    ]);
    mockPrisma.learningProfile.findUnique.mockResolvedValue({
      domainMasteries: [
        { domainId: "d1", score: 40 },
        { domainId: "d2", score: 60 },
      ],
    });
    mockPrisma.studyPlan.create.mockResolvedValue({ id: "plan-1", tasks: [] });

    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + 2); // two days of tasks

    await createStudyPlanForUser({
      userId: "user-1",
      targetExamDate: target,
      hoursPerDay: 2,
    });

    expect(mockPrisma.studyPlan.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "active" },
      data: { status: "archived" },
    });

    const createdData = mockPrisma.studyPlan.create.mock.calls[0][0].data;
    // 3 domains * 2 days = 6 tasks generated
    expect(createdData.tasks.create).toHaveLength(6);
    // Each task should have estimated minutes and domain focus set
    createdData.tasks.create.forEach((t: any) => {
      expect(t.estimatedMinutes).toBeGreaterThan(0);
      expect(t.domainFocus).toBeDefined();
    });
  });

  it("returns the active plan for a user", async () => {
    mockPrisma.studyPlan.findFirst.mockResolvedValue({ id: "plan-active" });

    const plan = await getActiveStudyPlan("user-1");
    expect(plan).toEqual({ id: "plan-active" });
    expect(mockPrisma.studyPlan.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "active" },
      orderBy: { createdAt: "desc" },
      include: { tasks: { orderBy: { date: "asc" } } },
    });
  });

  it("updates a study plan and regenerates tasks when date changes", async () => {
    mockPrisma.domain.findMany.mockResolvedValue([
      { id: "d1", name: "People", weightPercentage: 50 },
    ]);
    mockPrisma.learningProfile.findUnique.mockResolvedValue({
      domainMasteries: [{ domainId: "d1", score: 70 }],
    });
    mockPrisma.studyPlan.findUnique.mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      targetExamDate: new Date(),
      hoursPerDay: 1,
      tasks: [],
    });
    mockPrisma.studyPlan.update.mockResolvedValue({ id: "plan-1", tasks: [] });

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);

    await updateStudyPlanForUser({
      userId: "user-1",
      planId: "plan-1",
      targetExamDate: newDate,
      hoursPerDay: 1.5,
    });

    expect(mockPrisma.studyTask.deleteMany).toHaveBeenCalledWith({
      where: { planId: "plan-1" },
    });
    expect(mockPrisma.studyPlan.update).toHaveBeenCalled();
    const updateData = mockPrisma.studyPlan.update.mock.calls[0][0].data;
    expect(updateData.tasks.create.length).toBeGreaterThan(0);
  });
});
