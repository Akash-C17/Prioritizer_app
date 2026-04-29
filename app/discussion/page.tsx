"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";

interface Comment {
  id: string | number;
  author: string;
  text: string;
  timestamp: Date;
  reactions?: { emoji: string; count: number }[];
}

interface Discussion {
  id: string | number;
  topic: string;
  description?: string;
  comments: Comment[];
  status: "open" | "resolved" | "pending";
}

const initialDiscussions: Discussion[] = [
  {
    id: 1,
    topic: "Should we use microservices or monolith?",
    description: "Architectural decision for the new platform",
    comments: [],
    status: "open",
  },
  {
    id: 2,
    topic: "Timeline for MVP release",
    description: "When should we target for our minimum viable product?",
    comments: [],
    status: "pending",
  },
];

export default function Discussion() {
  const { projects, currentProject } = useProjectStore();
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | number>(1);
  const [newComment, setNewComment] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  const project = useMemo(
    () => projects.find((p: any) => p.id === currentProject),
    [projects, currentProject]
  );

  const selectedDiscussion = discussions.find((d) => d.id === selectedDiscussionId);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setDiscussions(
      discussions.map((d) =>
        d.id === selectedDiscussionId
          ? {
              ...d,
              comments: [
                ...d.comments,
                {
                  id: Date.now(),
                  author: "Current User",
                  text: newComment,
                  timestamp: new Date(),
                  reactions: [],
                },
              ],
            }
          : d
      )
    );

    setNewComment("");
    toast.success("Comment added");
  };

  const handleAddDiscussion = () => {
    if (!newTopic.trim()) {
      toast.error("Topic cannot be empty");
      return;
    }

    const discussion: Discussion = {
      id: Date.now(),
      topic: newTopic,
      description: "",
      comments: [],
      status: "open",
    };

    setDiscussions([...discussions, discussion]);
    setSelectedDiscussionId(discussion.id);
    setNewTopic("");
    setShowNewDiscussion(false);
    toast.success("Discussion created");
  };

  const handleDeleteComment = (commentId: string | number) => {
    setDiscussions(
      discussions.map((d) =>
        d.id === selectedDiscussionId
          ? { ...d, comments: d.comments.filter((c) => c.id !== commentId) }
          : d
      )
    );
    toast.success("Comment deleted");
  };

  const handleUpdateStatus = (status: Discussion["status"]) => {
    setDiscussions(
      discussions.map((d) => (d.id === selectedDiscussionId ? { ...d, status } : d))
    );
    toast.success(`Status changed to ${status}`);
  };

  const statusColors: Record<Discussion["status"], string> = {
    open: "bg-blue-900/30 text-blue-300 border border-blue-500/50",
    resolved: "bg-green-900/30 text-green-300 border border-green-500/50",
    pending: "bg-yellow-900/30 text-yellow-300 border border-yellow-500/50",
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Product Discussion Panel</h1>
          {project && (
            <p className="text-gray-400">
              Project: <span className="text-blue-400">{project.name}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discussions List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold mb-3">Discussions</h2>
                <button
                  onClick={() => setShowNewDiscussion(!showNewDiscussion)}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                >
                  + New Discussion
                </button>
              </div>

              {showNewDiscussion && (
                <div className="p-4 border-b border-gray-700 space-y-2">
                  <input
                    type="text"
                    placeholder="Discussion topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddDiscussion}
                      className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewDiscussion(false)}
                      className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {discussions.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDiscussionId(d.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedDiscussionId === d.id
                        ? "bg-gray-700 border-l-2 border-blue-500"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{d.topic}</p>
                        <p className="text-xs text-gray-500 mt-1">{d.comments.length} comments</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Discussion Detail */}
          {selectedDiscussion && (
            <div className="lg:col-span-2">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedDiscussion.topic}</h2>
                    <p className="text-gray-400 mt-1">{selectedDiscussion.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-medium ${statusColors[selectedDiscussion.status]}`}>
                    {selectedDiscussion.status}
                  </div>
                </div>

                {/* Status Options */}
                <div className="flex gap-2 mb-6 pb-6 border-b border-gray-700">
                  {(["open", "pending", "resolved"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                        selectedDiscussion.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Comments */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedDiscussion.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Start the discussion!</p>
                  ) : (
                    selectedDiscussion.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-900 border border-gray-700 rounded p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{comment.author}</p>
                              <p className="text-xs text-gray-500">
                                {comment.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-red-900/30 rounded text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-300">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleAddComment();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-16"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium flex items-center gap-2 transition-colors self-end"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
