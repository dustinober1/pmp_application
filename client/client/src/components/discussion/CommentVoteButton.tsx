import React from 'react';
import { ThumbsUp } from 'lucide-react';

interface CommentVoteButtonProps {
  upvotes: number;
  hasVoted: boolean;
  onVote: () => Promise<void> | void;
  onUnvote: () => Promise<void> | void;
  disabled?: boolean;
}

const CommentVoteButton: React.FC<CommentVoteButtonProps> = ({
  upvotes,
  hasVoted,
  onVote,
  onUnvote,
  disabled = false,
}) => {
  const handleClick = async () => {
    if (disabled) return;
    if (hasVoted) {
      await onUnvote();
    } else {
      await onVote();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border transition ${
        hasVoted
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      aria-pressed={hasVoted}
    >
      <ThumbsUp className="w-4 h-4" />
      <span className="text-sm font-medium">{upvotes}</span>
    </button>
  );
};

export default CommentVoteButton;
