import React, { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftIcon, 
  PaperAirplaneIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { taskCommentsService, TaskComment } from '../../services/taskCommentsService';
import { usePermissions } from '../../hooks/usePermissions';
import { demoModeService } from '../../services/demoModeService';

interface TaskCommentsTabProps {
  taskId: string;
  projectId: string;
  isDemoMode?: boolean;
}

const TaskCommentsTab: React.FC<TaskCommentsTabProps> = ({
  taskId,
  projectId,
  isDemoMode: propIsDemoMode
}) => {
  const { canAccess } = usePermissions();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const canView = canAccess('programme.comments.view');
  const canCreate = canAccess('programme.comments.create');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      if (propIsDemoMode !== undefined) {
        setIsDemoMode(propIsDemoMode);
      } else {
        const isDemo = await demoModeService.isDemoMode();
        setIsDemoMode(isDemo);
      }
    };
    checkDemoMode();
  }, [propIsDemoMode]);

  // Load comments on mount
  useEffect(() => {
    if (taskId && canView) {
      loadComments();
    }
  }, [taskId, canView]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await taskCommentsService.getTaskComments(taskId);
      
      if (result.success && result.comments) {
        setComments(result.comments);
      } else {
        setError(result.error || 'Failed to load comments');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!canCreate || !newComment.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const result = await taskCommentsService.addComment(taskId, newComment.trim());
      
      if (result.success && result.comment) {
        setComments(prev => [...prev, result.comment!]);
        setNewComment('');
      } else {
        setError(result.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setSaving(false);
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!canCreate || !replyContent.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const result = await taskCommentsService.addComment(taskId, replyContent.trim(), parentCommentId);
      
      if (result.success && result.comment) {
        setComments(prev => [...prev, result.comment!]);
        setReplyContent('');
        setReplyTo(null);
      } else {
        setError(result.error || 'Failed to add reply');
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply');
    } finally {
      setSaving(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const result = await taskCommentsService.updateComment(commentId, editContent.trim());
      
      if (result.success && result.comment) {
        setComments(prev => prev.map(c => c.id === commentId ? result.comment! : c));
        setEditContent('');
        setEditingComment(null);
      } else {
        setError(result.error || 'Failed to update comment');
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setSaving(true);
      setError(null);

      const result = await taskCommentsService.deleteComment(commentId);
      
      if (result.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        setError(result.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (comment: TaskComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const startReply = (commentId: string) => {
    setReplyTo(commentId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyContent('');
  };

  const renderComment = (comment: TaskComment, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyTo === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
        <div className="rounded-md border p-3 bg-white shadow-sm">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-900 mb-2">{comment.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 italic">
                  – {comment.authorName} ({comment.authorRole}) • {taskCommentsService.formatTimestamp(comment.createdAt)}
                  {comment.demo && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      DEMO
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {!isReply && canCreate && (
                    <button
                      onClick={() => startReply(comment.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Reply
                    </button>
                  )}
                  {canCreate && (
                    <>
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="ml-4 mt-3">
            <div className="rounded-md border p-3 bg-gray-50">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Write a reply..."
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleAddReply(comment.id)}
                  disabled={saving || !replyContent.trim()}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-3 h-3" />
                  Reply
                </button>
                <button
                  onClick={cancelReply}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render replies */}
        {comments
          .filter(c => c.parentCommentId === comment.id)
          .map(reply => renderComment(reply, true))}
      </div>
    );
  };

  if (!canView) {
    return (
      <div className="text-center py-8">
        <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">You don't have permission to view comments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Task Comments
        </h3>
        {isDemoMode && (
          <div className="flex items-center gap-1 text-sm text-yellow-600">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Demo Mode - Max 5 comments</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Be the first to add a comment
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments
            .filter(c => !c.parentCommentId) // Only top-level comments
            .map(comment => renderComment(comment))}
        </div>
      )}

      {/* Add new comment */}
      {canCreate && (
        <div className="border-t pt-4">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add a comment..."
              disabled={saving}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={handleAddComment}
                disabled={saving || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {saving ? 'Adding...' : 'Add Comment'}
              </button>
              {isDemoMode && (
                <span className="text-sm text-gray-500">
                  {comments.length}/{5} comments used
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCommentsTab; 