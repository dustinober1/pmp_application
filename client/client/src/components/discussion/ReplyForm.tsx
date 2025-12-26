import React from 'react';
import CommentForm from './CommentForm';

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void> | void;
  placeholder?: string;
  autoFocus?: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  placeholder = 'Write a reply...',
  autoFocus = true,
}) => {
  return (
    <div className="mt-3 pl-4 border-l border-gray-200">
      <CommentForm
        onSubmit={onSubmit}
        placeholder={placeholder}
        autoFocus={autoFocus}
        submitLabel="Reply"
      />
    </div>
  );
};

export default ReplyForm;
