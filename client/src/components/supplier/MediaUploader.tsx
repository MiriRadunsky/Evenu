// import React, { useState } from "react";
// import { ImagePlus, UploadCloud, Trash2, Loader2 } from "lucide-react";
// import { uploadFileToS3 } from "../../services/uploadFile";

// export default function MediaUploader() {
//   const [profileImage, setProfileImage] = useState<File | null>(null);
//   const [mediaFiles, setMediaFiles] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleUpload = async () => {
//     setLoading(true);
//     const uploadedData: {
//       profileImage?: {
//         url: string;
//         alt: string;
//       };
//       media?: {
//         images: {
//           url: string;
//           alt: string;
//         };
//         videos: string[];
//       };
//     } = {};
//     // const uploadedData: { profileImage?: string; media?: string[] } = {};

//     try {
//       if (profileImage) {
//         uploadedData.profileImage?.url = await uploadFileToS3(profileImage);
        
//       }

//       if (mediaFiles.length > 0) {
//         const uploadedMediaUrls: string[] = [];
//         for (const file of mediaFiles) {
//           const url = await uploadFileToS3(file);
//           uploadedMediaUrls.push(url);
//         }
//         uploadedData.media = uploadedMediaUrls;
//       }

//       // onUploaded(uploadedData);
//       // onFinish();
//     } catch (err) {
//       console.error("Upload error:", err);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-lg space-y-6">
//       {/* פרופיל */}
//       <div>
//         <label className="block text-sm text-[#2d2d35] mb-2 font-light">
//           תמונת פרופיל
//         </label>
//         <div className="flex items-center gap-3">
//           <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#d4a960] rounded-2xl text-white font-light hover:bg-[#c89645] transition">
//             <ImagePlus className="w-4 h-4" />
//             בחרי תמונה
//             <input
//               type="file"
//               className="hidden"
//               onChange={(e) =>
//                 e.target.files && setProfileImage(e.target.files[0])
//               }
//             />
//           </label>
//           {profileImage && (
//             <div className="relative">
//               <span className="text-sm text-gray-700">{profileImage.name}</span>
//               <button
//                 className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
//                 onClick={() => setProfileImage(null)}
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* מדיה */}
//       <div>
//         <label className="block text-sm text-[#2d2d35] mb-2 font-light">
//           מדיה נוספת
//         </label>
//         <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
//           <UploadCloud className="w-4 h-4" />
//           העלאת קבצים
//           <input
//             type="file"
//             multiple
//             className="hidden"
//             onChange={(e) =>
//               e.target.files &&
//               setMediaFiles([...mediaFiles, ...Array.from(e.target.files)])
//             }
//           />
//         </label>

//         {mediaFiles.length > 0 && (
//           <div className="grid grid-cols-3 gap-3 mt-3">
//             {mediaFiles.map((file, idx) => (
//               <div key={idx} className="relative rounded-xl overflow-hidden">
//                 <img
//                   src={URL.createObjectURL(file)}
//                   className="w-full h-24 object-cover rounded-xl"
//                 />
//                 <button
//                   className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
//                   onClick={() =>
//                     setMediaFiles(mediaFiles.filter((_, i) => i !== idx))
//                   }
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* כפתור העלאה */}
//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="w-full h-14 rounded-2xl gradient-gold text-white font-light shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
//       >
//         {loading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
//         {loading ? "מעלה..." : "העלה קבצים"}
//       </button>
//     </div>
//   );
// }


import React, { useState } from "react";
import { ImagePlus, UploadCloud, Trash2, Loader2 } from "lucide-react";
import { uploadFileToS3 } from "../../services/uploadFile";
import api from "../../services/axios";

// interface UploadedData {
//   profileImage?: { url: string; alt: string };
//   media?: { images: { url: string; alt: string }[]; videos: string[] };
// }

export default function MediaUploader(onRegister: () => void) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

 const handleUpload = async () => {
  setLoading(true);

  const uploadedData: {
    profileImage?: { key: string; alt: string };
    media?: { images: { key: string; alt: string }[]; videos:{key: string} [] };
  } = {};

  try {
    if (profileImage) {
      await uploadFileToS3(profileImage)
      uploadedData.profileImage = {
        key: profileImage.name,
        alt: profileImage.name,
      };
    }

    if (mediaFiles.length > 0) {
      const images: {key: string; alt: string }[] = [];
      const videos: {key: string}[] = [];

      await Promise.all(
        mediaFiles.map(async (file) => {
           await uploadFileToS3(file);
          if (file.type.startsWith("image/")) {
            images.push({ key:file.name, alt: file.name });
          } else if (file.type.startsWith("video/")) {
            videos.push({ key:file.name});
          }
        })
      );

      uploadedData.media = { images, videos };
    }
    console.log("Uploaded data:", uploadedData);
    const res= await api.patch('/suppliers/add-images', {
      profileImage: uploadedData.profileImage,
      media: uploadedData.media,
    });
    onRegister()
    console.log("Uploaded data:", uploadedData,res);
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    setLoading(false);
  }
};

  const ProfileUpload = () => (
    <div>
      <label className="block text-sm text-[#2d2d35] mb-2 font-light">
        תמונת פרופיל
      </label>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#d4a960] rounded-2xl text-white font-light hover:bg-[#c89645] transition">
          <ImagePlus className="w-4 h-4" />
          בחרי תמונה
          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              e.target.files && setProfileImage(e.target.files[0])
            }
          />
        </label>
        {profileImage && (
          <div className="relative">
            <span className="text-sm text-gray-700">{profileImage.name}</span>
            <button
              className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
              onClick={() => setProfileImage(null)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MediaUpload = () => (
    <div>
      <label className="block text-sm text-[#2d2d35] mb-2 font-light">
        מדיה נוספת
      </label>
      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
        <UploadCloud className="w-4 h-4" />
        העלאת קבצים
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) =>
            e.target.files &&
            setMediaFiles([...mediaFiles, ...Array.from(e.target.files)])
          }
        />
      </label>

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {mediaFiles.map((file, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-24 object-cover rounded-xl"
              />
              <button
                className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                onClick={() =>
                  setMediaFiles(mediaFiles.filter((_, i) => i !== idx))
                }
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-lg space-y-6">
      <ProfileUpload />
      <MediaUpload />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full h-14 rounded-2xl gradient-gold text-white font-light shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : null}
        {loading ? "מעלה..." : "העלה קבצים"}
      </button>
    </div>
  );
}
