import { ProtectedRoute } from "@/components/auth/protected-route"
import { ImageGallery } from "@/components/gallery/image-gallery"
import { CommunityGallery } from "@/components/gallery/community-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users } from "lucide-react"

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="my-gallery" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Gallery
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="community">
            <CommunityGallery />
          </TabsContent>
          
          <TabsContent value="my-gallery">
            <ImageGallery />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
