"use client";

import { useState, useMemo } from "react";
import { useProjectStore } from "@/lib/store";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
    open: "bg-blue-100 text-blue-700 border border-blue-300",
    resolved: "bg-green-100 text-green-700 border border-green-300",
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Product Discussion Panel
          </h1>
          {project && (
            <p className="text-gray-700">
              Project: <span className="text-purple-600 font-semibold">{project.name}</span>
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discussions List */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white border-2 border-purple-300 rounded-lg overflow-hidden shadow-lg">
              <div className="p-4 border-b-2 border-purple-300 bg-gradient-to-r from-purple-50 to-orange-50">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Discussions</h2>
                <motion.button
                  onClick={() => setShowNewDiscussion(!showNewDiscussion)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded text-sm font-medium transition-all text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + New Discussion
                </motion.button>
              </div>

              {showNewDiscussion && (
                <motion.div 
                  className="p-4 border-b-2 border-purple-300 space-y-2 bg-purple-50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <input
                    type="text"
                    placeholder="Discussion topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-purple-300 rounded text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleAddDiscussion}
                      className="flex-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded text-xs font-medium transition-all text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create
                    </motion.button>
                    <motion.button
                      onClick={() => setShowNewDiscussion(false)}
                      className="flex-1 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium transition-all text-gray-900"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <div className="divide-y divide-purple-200 max-h-96 overflow-y-auto">
                {discussions.map((d, index) => (
                  <motion.button
                    key={d.id}
                    onClick={() => setSelectedDiscussionId(d.id)}
                    className={`w-full text-left px-4 py-3 transition-all ${
                      selectedDiscussionId === d.id
                        ? "bg-purple-100 border-l-4 border-purple-600"
                        : "hover:bg-gray-50"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{d.topic}</p>
                        <p className="text-xs text-gray-500 mt-1">{d.comments.length} comments</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Discussion Detail */}
          {selectedDiscussion && (
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white border-2 border-purple-300 rounded-lg p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDiscussion.topic}</h2>
                    <p className="text-gray-700 mt-1">{selectedDiscussion.description}</p>
                  </div>
                  <motion.div 
                    className={`px-3 py-1 rounded text-sm font-medium ${statusColors[selectedDiscussion.status]}`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {selectedDiscussion.status}
                  </motion.div>
                </div>

                {/* Status Options */}
                <div className="flex gap-2 mb-6 pb-6 border-b-2 border-gray-300">
                  {(["open", "pending", "resolved"] as const).map((status) => (
                    <motion.button
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize ${
                        selectedDiscussion.status === status
                          ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>

                {/* Comments */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedDiscussion.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Start the discussion!</p>
                  ) : (
                    selectedDiscussion.comments.map((comment, index) => (
                      <motion.div 
                        key={comment.id} 
                        className="bg-gray-50 border-2 border-gray-300 rounded p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <motion.div 
                              className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <User className="w-4 h-4 text-white" />
                            </motion.div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{comment.author}</p>
                              <p className="text-xs text-gray-500">
                                {comment.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </motion.div>
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
                    className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 resize-none h-16 transition-all"
                  />
                  <motion.button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:shadow-lg rounded font-medium flex items-center gap-2 transition-all text-white self-end"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
