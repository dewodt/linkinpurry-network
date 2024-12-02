import { createFileRoute } from "@tanstack/react-router";

import * as React from "react";

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, PlusIcon, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelmetTemplate } from "@/components/shared/helmet";
import { Textarea } from "@/components/ui/textarea"

// TODO: Match the Post type with the actual data from the backend
// Define the Post type
type Post = {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  user: {
    username: string;
    full_name: string;
    profile_photo_path: string;
  };
};

// TODO: Replace mock data with actual data from the backend
// Mock data with enhanced user information
const mockPosts: Post[] = [
  {
    id: 1,
    content: "Just completed another milestone in our project! Looking forward to sharing more updates with the team. The progress we've made is truly remarkable and I'm excited about the next phase.",
    created_at: "2023-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
    user_id: 1,
    user: {
      username: "johndoe",
      full_name: "John Doe",
      profile_photo_path: "/placeholder.svg"
    }
  },
  {
    id: 2,
    content: "Reflecting on our recent achievements and the challenges we've overcome. It's amazing to see how far we've come as a team. Every obstacle has been a learning opportunity.",
    created_at: "2023-06-02T14:30:00Z",
    updated_at: "2023-06-02T15:00:00Z",
    user_id: 1,
    user: {
      username: "johndoe",
      full_name: "John Doe",
      profile_photo_path: "/placeholder.svg"
    }
  },
  {
    id: 3,
    content: "Innovation never stops! Excited to share some insights from our latest development sprint. The new features we're working on will revolutionize how we approach our daily tasks.",
    created_at: "2023-06-03T09:15:00Z",
    updated_at: "2023-06-03T09:15:00Z",
    user_id: 1,
    user: {
      username: "johndoe",
      full_name: "John Doe",
      profile_photo_path: "/placeholder.svg"
    }
  },
]

export const Route = createFileRoute("/my-posts/")({
    component: RouteComponent,
});

function RouteComponent() {
  const [posts, setPosts] = React.useState(mockPosts)
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [postToDelete, setPostToDelete] = React.useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false) // Dialog for creating/editing posts pop up
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editingPostId, setEditingPostId] = React.useState<number | null>(null);
  const [dialogContent, setDialogContent] = React.useState("")
  
  // Handle sorting of posts based on creation date
  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order)
    // TODO: Check again if the sorting logic is correct and match with the backend
    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return order === "asc" ? dateA - dateB : dateB - dateA
    })
    setPosts(sortedPosts)
  }

  // Set "desc" as default sorting order on initial render
  React.useEffect(() => {
    handleSort("desc");
  });

  // Handle deletion of a post
  // TODO: Implement API call to delete post
  const handleDelete = () => {
    if (postToDelete !== null) {
      setPosts(posts.filter((post) => post.id !== postToDelete))
      setPostToDelete(null)
    }
    setIsDeleteDialogOpen(false)
  }

  // Handle creation of a new post
  // TODO: Implement API call to create post
  // const handleCreatePost = () => {
  //   if (dialogContent.trim()) {
  //     const newPost = {
  //       id: posts.length + 1,
  //       content: dialogContent,
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //       user_id: 1,
  //       user: {
  //         username: "johndoe",
  //         full_name: "John Doe",
  //         profile_photo_path: "/placeholder.svg"
  //       }
  //     }
  //     setPosts([newPost, ...posts])
  //     setDialogContent("")
  //     setIsDialogOpen(false)
  //   }
  // }

  const handleSavePost = () => {
    if (dialogMode === "create") {
      const newPost = {
        id: posts.length + 1,
        content: dialogContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 1,
        user: {
          username: "johndoe",
          full_name: "John Doe",
          profile_photo_path: "/placeholder.svg",
        },
      };
      setPosts([newPost, ...posts]);
    } else if (dialogMode === "edit" && editingPostId !== null) {
      setPosts(
        posts.map((post) =>
          post.id === editingPostId
            ? { ...post, content: dialogContent, updated_at: new Date().toISOString() }
            : post
        )
      );
    }
    setDialogContent("");
    setEditingPostId(null);
    setIsDialogOpen(false);
  };

  const handleOpenEditDialog = (postId: number, content: string) => {
    setDialogMode("edit");
    setEditingPostId(postId);
    setDialogContent(content);
    setIsDialogOpen(true);
  };

  const formatDate = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60))
    
    // Display date in relative format (e.g., "Just now", "4m", "2h", "3d")
    // Under 1 hour case (display in minutes)
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))
      // Display "Just now" if less than 1 minute
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m`
    } 
    // 1 hour to 24 hours case (display in hour)
    else if (diffInHours < 24) {
      return `${diffInHours}h`
    } 
    // Under 7 days case (display in day)
    else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d`
    }
    // Over 7 days case (display in week)
    else {
      return `${Math.floor(diffInHours / (24 * 7))}w`
    }
  }

  return (
    <>
      <HelmetTemplate title="My Posts | LinkinPurry" />
        
      {/* Main Content */}
      <div className="w-full max-w-2xl min-h-[calc(100vh-4rem)] mx-auto space-y-12 py-12 sm:p-12">
        {/* Header */}
        <div className="flex flex-col items-start justify-between p-4 gap-4">
          <h1 className="text-2xl font-bold">My Posts</h1>
          <div className="flex gap-4">
            <Select
              value={sortOrder}
              onValueChange={(value) => handleSort(value as "asc" | "desc")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Create Post Dialog (Pop Up) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setDialogMode("create"); setDialogContent("");}}>
                  <PlusIcon className="mr-2 h-4 w-4" /> Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] sm:min-h-[400px]">
                <DialogHeader className="flex flex-col items-start justify-between gap-4">
                  <DialogTitle className="text-xl">
                    {dialogMode === "create" ? "Create Post" : "Edit Post"}
                  </DialogTitle>
                  <div className="flex items-center gap-3">
                    {/* TODO: Get profile picture and full name from backend */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt="John Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <DialogTitle className="text-xl">John Doe</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="mt-4">
                  <Textarea
                    placeholder="What do you want to talk about?"
                    className="min-h-[250px] resize-none border-none text-lg focus-visible:ring-0"
                    value={dialogContent}
                    onChange={(e) => setDialogContent(e.target.value)}
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleSavePost}
                    disabled={!dialogContent.trim()}
                  >
                    {dialogMode === "create" ? "Post" : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* List of Posts */}
        <div className="space-y-4">
          {/* TODO: Change the variable posts.length to match in backend */}
          {posts.length === 0 ? (
            // Handle empty posts case
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">You have no posts yet</p>
            </div>
          ) : (
            // Render posts
            posts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Avatar className="h-12 w-12">
                      {/* TODO: Get user's profile picture from backend */}
                      <AvatarImage src={post.user.profile_photo_path} alt={post.user.full_name} />
                      <AvatarFallback>{post.user.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{post.user.full_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(post.created_at)} {post.created_at !== post.updated_at && "• Edited"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* TODO: Set Up Edit Button that Linked to edit page */}
                      <DropdownMenuItem onClick={() => handleOpenEditDialog(post.id, post.content)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setPostToDelete(post.id); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4">
                  {/* TODO: Make displayed content to handle enters  */}
                  {/* TODO: Get post content from backend */}
                  <p className="text-sm">{post.content}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog (Pop Up) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
