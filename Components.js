// const RandomString = require("randomstring");
// const path = require('path');
// const fs = require('fs');

// class Components {
//     uploadFile(file) {
//         if (!Array.isArray(file)) {
//             // If it's a single file, convert it to an array for uniform processing
//             file = [file];
//         }


//         let uploadedFiles = [];
//         file.forEach(file => {
//             let fileExt =  file.media ? file.media : file.name

//             let fileName = RandomString.generate({
//                 length: 12,
//                 charset: 'alphabetic'
//             });

//             let ext = fileExt.split(".");
//             ext = ext[ext.length - 1];
//             fileName = fileName + "." + ext;
//             let filePath = "/public/media/" + fileName;
//             file.mv("." + filePath);

//             uploadedFiles.push({
//                 fileName: fileName,
//                 filePath: filePath
//             });
//         });

//         return uploadedFiles;

//         // let fileName = RandomString.generate({
//         //     length: 12,
//         //     charset: 'alphabetic'
//         // })

//         // let ext = file.media.split(".")
//         // ext = ext[ext.length - 1]
//         // fileName = fileName + "." + ext
//         // let filePath = "/public/media/" + fileName
//         // file.mv("." + filePath)
//         // return {
//         //     fileName: fileName,
//         //     filePath: filePath
//         // }
//     }

// }

// const components = new Components()

// module.exports = components
// const fs = require('fs');
// const path = require('path');
// const RandomString = require('randomstring'); // Assuming you have this module for generating random strings

// function ensureDirectoryExistence(dirPath) {
//     if (!fs.existsSync(dirPath)) {
//         fs.mkdirSync(dirPath, { recursive: true });
//     }
// }

// function uploadFile(files) {
//     if (!Array.isArray(files)) {
//         // If it's a single file, convert it to an array for uniform processing
//         files = [files];
//     }

//     let uploadedFiles = {
//         imagesPath:[],
//         videoPath: ""
//     };

//     let imageCount = 1;

//     files.forEach(file => {
//         let fileExt = file.media ? file.media : file.name;
//         let fileName = RandomString.generate({
//             length: 12,
//             charset: 'alphabetic'
//         });

//         let ext = fileExt.split(".");
//         ext = ext[ext.length - 1];
//         fileName = fileName + "." + ext;

//         let filePath;
//         if (['jpg', 'jpeg', 'png', 'gif'].includes(ext.toLowerCase())) {
//             // For images
//             const mediaDir = path.join(__dirname, 'public', 'media');
//             ensureDirectoryExistence(mediaDir);
//             filePath = path.join(mediaDir, fileName);
//             uploadedFiles.imagesPath.push(filePath)
//             // if (imageCount <= 5) {
//             //     imageCount++;
//             // }
//         } else if (['pdf'].includes(ext.toLowerCase())) {
//             // For PDFs
//             const docDir = path.join(__dirname, 'public', 'documents');
//             ensureDirectoryExistence(docDir);
//             filePath = path.join(docDir, fileName);
//         } else if (['mp4', 'avi', 'mov'].includes(ext.toLowerCase())) {
//             // For videos
//             const videoDir = path.join(__dirname, 'public', 'videos');
//             ensureDirectoryExistence(videoDir);
//             filePath = path.join(videoDir, fileName);
//             uploadedFiles.videoPath = filePath;
//         } else {
//             // Handle other file types if needed
//             throw new Error('Unsupported file type');
//         }

//         file.mv(filePath);
//     });

//     return uploadedFiles;
// }

// module.exports = {
//     uploadFile
// };



const path = require('path');
const RandomString = require('randomstring');
const fs = require('fs');

// Ensure the directory exists, create if not
function ensureDirectoryExistence(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function uploadFile(files, type) {
    if (!Array.isArray(files)) {
        // If it's a single file, convert it to an array for uniform processing
        files = [files];
    }

    let uploadedFiles = {
        imagesPath: [],
        documentPath: [],
        videoPath: "",
        addressProof: []
    };

    files.forEach(file => {
        let fileExt = file.media ? file.media : file.name;
        let fileName = RandomString.generate({
            length: 12,
            charset: 'alphabetic'
        });

        let ext = fileExt.split(".");
        ext = ext[ext.length - 1];
        fileName = fileName + "." + ext;

        let filePath;
        let relativePath;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext.toLowerCase())) {
            // For images
            const mediaDir = path.join(__dirname, 'public', 'media');
            ensureDirectoryExistence(mediaDir); 
            filePath = path.join(mediaDir, fileName);
            relativePath = path.join('public', 'media', fileName);
            type == "AddressProfe" ? uploadedFiles.addressProof.push(relativePath) : type == "Doc" ? uploadedFiles.documentPath.push(relativePath) : uploadedFiles.imagesPath.push(relativePath);
        } else if (['pdf'].includes(ext.toLowerCase())) {
            // For PDFs
            const docDir = path.join(__dirname, 'public', 'documents');
            ensureDirectoryExistence(docDir);
            filePath = path.join(docDir, fileName);
            relativePath = path.join('public', 'documents', fileName);
            uploadedFiles.documentPath.push(relativePath);
            // Assuming you'd like to store PDF paths too, handle it here
        } else if (['mp4', 'avi', 'mov'].includes(ext.toLowerCase())) {
            // For videos
            const videoDir = path.join(__dirname, 'public', 'videos');
            ensureDirectoryExistence(videoDir);
            filePath = path.join(videoDir, fileName);
            relativePath = path.join('public', 'videos', fileName);
            uploadedFiles.videoPath = relativePath;
        } else {
            // Handle other file types if needed
            throw new Error('Unsupported file type');
        }

        // Move the file to the target directory
        file.mv(filePath, (err) => {
            if (err) {
                throw new Error(`Failed to move file: ${err.message}`);
            }
        });
    });

    return uploadedFiles;
}

module.exports = { uploadFile };
