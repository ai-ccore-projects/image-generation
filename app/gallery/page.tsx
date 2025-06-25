import { ProtectedRoute } from "@/components/auth/protected-route"
import { ImageGallery } from "@/components/gallery/image-gallery"
import { CommunityGallery } from "@/components/gallery/community-gallery"
import { UploadedImages } from "@/components/gallery/uploaded-images"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, Upload } from "lucide-react"

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="my-gallery" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Gallery
            </TabsTrigger>
            <TabsTrigger value="uploaded-images" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Uploaded Images
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="community">
            <CommunityGallery />
          </TabsContent>
          
          <TabsContent value="my-gallery">
            <ImageGallery />
          </TabsContent>
          
          <TabsContent value="uploaded-images">
            <UploadedImages />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
