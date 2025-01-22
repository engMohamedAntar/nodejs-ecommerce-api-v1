//uploadimageMiddleware.js
const multer= require('multer');
const ApiError= require('../utils/ApiError');

const multerOptions= ()=>{
 // 1-DiskStorage engine (creates a req.file)
    // const diskStorage= multer.diskStorage({
    //     destination: function(req,file,cb){
    //         cb(null,'uploads/categories');
    //     },
    //     filename: function(req,file,cb){
    //         const ext= file.mimetype.split('/')[1];
    //         const filename= `category-${uuidv4()}-${Date.now()}.${ext}`;
    //         cb(null,filename);
    //     }
    // });

   // 2-MemoryStorage engine (creates a req.file.buffer)
    const memoryStorage= multer.memoryStorage();

    //fileFilter
    const multerFilter= function(req,file,cb) {
        console.log('multerFilter: ', req.body);
        
        if(file.mimetype.startsWith('image'))
            cb(null,true);
        else
            cb(new ApiError('file is not image',400),false);
        
    };
    //create an object of multer
    const upload= multer ({storage: memoryStorage, fileFilter: multerFilter});
    return upload;
}

exports.uploadSingleImage= (fieldName)=> multerOptions().single(fieldName);

exports.uploadMixOfImages= (fields)=> multerOptions().fields(fields);


//notices
