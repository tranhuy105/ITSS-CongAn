import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react'; // ADDED hooks

const LocalDropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const LocalDropdownMenuTrigger: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-full shrink-0 cursor-pointer"
      onClick={onClick}
    >
      <MoreVertical className="w-4 h-4" />
    </Button>
  );
};

interface LocalDropdownMenuContentProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const LocalDropdownMenuContent: React.FC<LocalDropdownMenuContentProps> = ({
  children,
  isOpen,
  menuRef,
}) => {
  if (!isOpen) {
    return null;
  }

  // Fixed alignment to 'end' (right-0) based on typical use case
  const alignment = 'right-0';

  return (
    <div
      ref={menuRef}
      className={`absolute mt-2 min-w-[150px] ${alignment} bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden`}
    >
      {children}
    </div>
  );
};

interface LocalDropdownMenuItemProps {
  children: React.ReactNode;
  onClick: () => void; // MODIFIED: onClick is required now
  className?: string;
}

const LocalDropdownMenuItem: React.FC<LocalDropdownMenuItemProps> = ({
  children,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer select-none ${className || ''}`}
    >
      {children}
    </div>
  );
};

interface ReviewCardProps {
  review: {
    _id: string;
    user: {
      _id: string;
      name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
  };
  currentUserId: string | undefined;
  onEdit: () => void;
  onDelete: (reviewId: string) => void;
}

export const ReviewCard = ({ review, currentUserId, onEdit, onDelete }: ReviewCardProps) => {
  const isAuthor = currentUserId === review.user._id;
  const [isOpen, setIsOpen] = useState(false); // State to control menu visibility
  const menuRef = useRef<HTMLDivElement>(null); // Ref for click outside logic

  // Logic to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEditClick = () => {
    onEdit();
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete(review._id);
    setIsOpen(false);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* Reviewer Name */}
              <div className="font-semibold text-sm">{review.user.name}</div>
              {/* Star Rating */}
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-4 h-4 ${
                      index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </span>
            </div>
            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>

          {isAuthor && (
            // Sử dụng các Local Dropdown Component
            <LocalDropdownMenu>
              <LocalDropdownMenuTrigger onClick={handleToggle} />
              <LocalDropdownMenuContent
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                menuRef={menuRef}
              >
                <LocalDropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </LocalDropdownMenuItem>
                <LocalDropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </LocalDropdownMenuItem>
              </LocalDropdownMenuContent>
            </LocalDropdownMenu>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Reviewed on {format(new Date(review.createdAt), 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
};
