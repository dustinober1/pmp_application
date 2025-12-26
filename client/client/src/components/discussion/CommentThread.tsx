import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import CommentForm from './CommentForm';
import ReplyForm from './ReplyForm';
import CommentVoteButton from './CommentVoteButton';
import { discussionService } from '../../services/discussionService';
import type { CommentSort } from '../../services/discussionService';
import type { DiscussionComment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingState from '../ui/LoadingState';
import ErrorMessage from '../ui/ErrorMessage';

interface CommentThreadProps {
  questionId: string;
  onCountChange?: (count: number) => void;
}

const countComments = (comments: DiscussionComment[]): number =>
  comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);

const CommentThread: React.FC<CommentThreadProps> = ({ questionId, onCountChange }) => {
  const { isAuthenticated } = useAuth();
  const [sort, setSort] = useState<CommentSort>('newest');
  const queryClient = useQueryClient();
  const [commentCount, setCommentCount] = useState(0);
  const queryKey = ['discussion', questionId || '', sort] as const;

  const {
    data: comments = [],
    isLoading,
    isError,
    error,
  } = useQuery<DiscussionComment[], Error>({
    queryKey,
    queryFn: () => discussionService.getComments(questionId, sort),
    enabled: !!questionId,
  });

  useEffect(() => {
    const nextCount = countComments(comments || []);
    setCommentCount(nextCount);
    if (onCountChange) {
      onCountChange(nextCount);
    }
  }, [comments, onCountChange]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['discussion', questionId] });

  const createMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => {
      await discussionService.createComment(questionId, content, parentId);
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      await discussionService.updateComment(id, content);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await discussionService.deleteComment(id);
    },
    onSuccess: invalidate,
  });

  const voteMutation = useMutation({
    mutationFn: async (id: string) => {
      await discussionService.voteComment(id);
    },
    onSuccess: invalidate,
  });

  const unvoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await discussionService.unvoteComment(id);
    },
    onSuccess: invalidate,
  });

  const reportMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await discussionService.reportComment(id, reason);
    },
    onSuccess: invalidate,
  });

  const handleCreate = async (content: string, parentId?: string) => {
    await createMutation.mutateAsync({ content, parentId });
  };

  if (isLoading) {
    return <LoadingState message="Loading discussion..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to load comments"
        message={error instanceof Error ? error.message : 'Please try again'}
      />
    );
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-gray-800">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold">
            Discussion ({commentCount} {commentCount === 1 ? 'comment' : 'comments'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort:</span>
          {(['newest', 'top'] as CommentSort[]).map((option) => (
            <button
              key={option}
              onClick={() => setSort(option)}
              className={`px-3 py-1 text-sm rounded-lg border transition ${
                sort === option
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option === 'newest' ? 'Newest' : 'Top'}
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Please log in to post, vote, or reply to comments.
        </div>
      )}

      {isAuthenticated && (
        <div className="mb-6">
          <CommentForm onSubmit={(content) => handleCreate(content)} />
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-600">No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map((comment: DiscussionComment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={(parentId, content) => handleCreate(content, parentId)}
              onUpdate={(id, content) => updateMutation.mutateAsync({ id, content })}
              onDelete={(id) => deleteMutation.mutateAsync(id)}
              onVote={(id) => voteMutation.mutateAsync(id)}
              onUnvote={(id) => unvoteMutation.mutateAsync(id)}
              onReport={async (id) => {
                const reason = window.prompt('Report reason (optional, max 200 chars):', 'Inappropriate content');
                if (reason && reason.trim()) {
                  await reportMutation.mutateAsync({ id, reason: reason.trim().slice(0, 200) });
                }
              }}
              isAuthenticated={isAuthenticated}
            />
          ))
        )}
      </div>
    </section>
  );
};

interface CommentCardProps {
  comment: DiscussionComment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onVote: (id: string) => Promise<void>;
  onUnvote: (id: string) => Promise<void>;
  onReport: (id: string) => Promise<void>;
  isAuthenticated: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  onVote,
  onUnvote,
  onReport,
  isAuthenticated,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  const canEdit = user?.id === comment.userId;
  const canDelete = canEdit;

  const saveEdit = async () => {
    await onUpdate(comment.id, draft.trim());
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {comment.user.firstName} {comment.user.lastName}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {comment.user.role}
            </span>
            {comment.isExpertVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <CommentVoteButton
          upvotes={comment.upvotes}
          hasVoted={comment.hasVoted}
          onVote={() => onVote(comment.id)}
          onUnvote={() => onUnvote(comment.id)}
          disabled={!isAuthenticated}
        />
      </div>

      <div className="mt-3 space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={saveEdit}
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                disabled={draft.trim().length < 3}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDraft(comment.content);
                }}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 leading-relaxed">{comment.content}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        {isAuthenticated && (
          <button
            onClick={() => setIsReplying((prev) => !prev)}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        )}
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="font-medium text-gray-700 hover:text-gray-900"
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={async () => {
              if (window.confirm('Delete this comment?')) {
                await onDelete(comment.id);
              }
            }}
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            Delete
          </button>
        )}
        <button
          onClick={() => onReport(comment.id)}
          className="font-medium text-gray-500 hover:text-gray-700"
        >
          Report
        </button>
      </div>

      {isReplying && (
        <ReplyForm
          onSubmit={async (content) => {
            await onReply(comment.id, content);
            setIsReplying(false);
          }}
        />
      )}

      {comment.replies?.length > 0 && (
        <div className="mt-4 space-y-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="pl-4 border-l border-gray-200">
              <CommentCard
                comment={reply}
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onVote={onVote}
                onUnvote={onUnvote}
                onReport={onReport}
                isAuthenticated={isAuthenticated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
