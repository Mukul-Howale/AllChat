import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Flag, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ChatFeedbackProps {
  chatId: string;
  participantId: string;
}

const ChatFeedback: React.FC<ChatFeedbackProps> = ({ chatId, participantId }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);

  const handleLike = () => {
    if (disliked) setDisliked(false);
    setLiked(!liked);
    // TODO: API call to update like status
  };

  const handleDislike = () => {
    if (liked) setLiked(false);
    setDisliked(!disliked);
    // TODO: API call to update dislike status
  };

  const handleReport = () => {
    // TODO: API call to submit report
    setShowReportDialog(false);
    setReportReason('');
  };

  const handleRating = () => {
    // TODO: API call to submit rating
    setShowRatingDialog(false);
  };

  return (
    <div className="flex items-center space-x-2 animate-fade-in">
      <Button
        onClick={handleLike}
        className={`p-2 rounded-full elevation-1 button-hover focus-ring ${
          liked
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
        } transition-all duration-200`}
        aria-label="Like this chat"
      >
        <ThumbsUp className="w-5 h-5" />
      </Button>

      <Button
        onClick={handleDislike}
        className={`p-2 rounded-full elevation-1 button-hover focus-ring ${
          disliked
            ? 'bg-error-500 text-white hover:bg-error-600'
            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
        } transition-all duration-200`}
        aria-label="Dislike this chat"
      >
        <ThumbsDown className="w-5 h-5" />
      </Button>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogTrigger asChild>
          <Button
            className="p-2 rounded-full elevation-1 button-hover focus-ring bg-surface-100 text-surface-600 hover:bg-surface-200"
            aria-label="Rate this chat"
          >
            <Star className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Chat Experience</DialogTitle>
            <DialogDescription>
              How would you rate your interaction with this participant?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                onClick={() => setRating(star)}
                className={`p-2 rounded-full ${
                  rating >= star
                    ? 'bg-secondary-500 text-white hover:bg-secondary-600'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                <Star className="w-5 h-5" />
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRatingDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleRating} className="bg-primary-500 text-white">
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogTrigger asChild>
          <Button
            className="p-2 rounded-full elevation-1 button-hover focus-ring bg-surface-100 text-surface-600 hover:bg-surface-200"
            aria-label="Report this chat"
          >
            <Flag className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Inappropriate Behavior</DialogTitle>
            <DialogDescription>
              Please describe why you're reporting this chat. This will be reviewed by our moderators.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please provide details about your report..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button onClick={() => setShowReportDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              className="bg-error-500 text-white"
              disabled={!reportReason.trim()}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatFeedback;
