import { useState } from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Image, X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Notes = () => {
  const navigate = useNavigate();
  const { profile, addNote, deleteNote } = useUserData();
  const { toast } = useToast();

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteImage, setNoteImage] = useState<string | null>(null);
  const [noteImageFile, setNoteImageFile] = useState<File | null>(null);

  

  const handleAddNote = async () => {
    try {
      let imageUrl: string | undefined;

      if (noteImageFile) {
        imageUrl = await convertToBase64(noteImageFile);
      }

      addNote(noteContent, imageUrl);
      setNoteContent("");
      setNoteImage(null);
      setNoteImageFile(null);
      setIsAddingNote(false);

      toast({
        title: "Note Added",
        description: "Your note has been saved successfully.",
      });
    } catch (error) {
      console.error("Image processing failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem processing the image.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setNoteImage(URL.createObjectURL(file));
      setNoteImageFile(file);
      toast({
        title: "Image Selected",
        description: "Your image has been added to the note.",
      });
    }
  };

  const handleCaptureImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const base64 = await convertToBase64(file);
      setNoteImage(base64); // this will be stored in Firestore
      setNoteImageFile(file);
      toast({
        title: "Photo Captured",
        description: "Your photo has been added to the note.",
      });
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    toast({
      title: "Note Deleted",
      description: "Your note has been removed.",
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  

  return (
    <div className="flex h-screen overflow-y-auto flex-col pomoflo-container bg-pomoflo-background">
      <header className="flex items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
          className="text-white hover:bg-pomoflo-darkPurple/20 mr-auto"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="mx-auto font-bold text-lg text-white">Notes</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAddingNote(true)}
          className="text-white hover:bg-pomoflo-darkPurple/20 ml-auto"
          disabled={isAddingNote}
        >
          <Plus size={24} />
        </Button>
      </header>

      <div className="p-4 flex-1">
        {isAddingNote ? (
          <div className="bg-pomoflo-darkPurple/30 rounded-lg p-4 mb-4">
            <h3 className="text-white font-medium mb-3">New Note</h3>

            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className="bg-pomoflo-darkPurple/30 border-none text-white resize-none mb-3 h-32"
            />

            {noteImage ? (
              <div className="relative mb-3">
                <img
                  src={noteImage}
                  alt="Note attachment"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full h-8 w-8 bg-red-500/80"
                  onClick={() => setNoteImage(null)}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-full bg-pomoflo-darkPurple/20 border-dashed border-white/30 text-white mb-3 py-8"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <Image size={24} className="mr-2" /> Add Image
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full bg-pomoflo-darkPurple/20 border-dashed border-white/30 text-white mb-3 py-8"
                  onClick={() => document.getElementById("cameraInput")?.click()}
                >
                  <Image size={24} className="mr-2" /> Capture Photo
                </Button>
                <input
                  id="cameraInput"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCaptureImage}
                  className="hidden"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-white/30 text-white"
                onClick={() => {
                  setIsAddingNote(false);
                  setNoteContent("");
                  setNoteImage(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-pomoflo-purple"
                onClick={handleAddNote}
                disabled={!noteContent.trim() && !noteImage}
              >
                <Save size={16} className="mr-2" /> Save Note
              </Button>
            </div>
          </div>
        ) : (
          <>
            {profile?.notes && profile.notes.length > 0 ? (
              <div className="space-y-4">
                {profile.notes.map((note) => (
                  <div key={note.id} className="bg-pomoflo-darkPurple/20 rounded-lg p-4">
                    {note.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={note.imageUrl}
                          alt="Note attachment"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-white mb-3">{note.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-xs">
                        {formatDate(note.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-transparent p-0"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-white/50 text-center mb-4">
                  No notes yet. Add your first note!
                </p>
                <Button
                  className="bg-pomoflo-purple"
                  onClick={() => setIsAddingNote(true)}
                >
                  <Plus size={18} className="mr-2" /> Add Note
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;
