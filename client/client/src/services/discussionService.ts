import api from './api';
import type { DiscussionComment } from '../types';

export type CommentSort = 'newest' | 'top';

export const discussionService = {
  async getComments(questionId: string, sort: CommentSort = 'newest'): Promise<DiscussionComment[]> {
    const res = await api.get(`/questions/${questionId}/comments`, { params: { sort } });
    return res.data;
  },

  async createComment(questionId: string, content: string, parentId?: string): Promise<DiscussionComment> {
    const res = await api.post(`/questions/${questionId}/comments`, { content, parentId });
    return res.data;
  },

  async updateComment(commentId: string, content: string): Promise<DiscussionComment> {
    const res = await api.put(`/comments/${commentId}`, { content });
    return res.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },

  async voteComment(commentId: string): Promise<{ alreadyVoted: boolean }> {
    const res = await api.post(`/comments/${commentId}/vote`);
    return res.data;
  },

  async unvoteComment(commentId: string): Promise<{ removed: boolean }> {
    const res = await api.delete(`/comments/${commentId}/vote`);
    return res.data;
  },

  async reportComment(commentId: string, reason: string): Promise<{ reported: true }> {
    const res = await api.post(`/comments/${commentId}/report`, { reason });
    return res.data;
  },
};

export default discussionService;
