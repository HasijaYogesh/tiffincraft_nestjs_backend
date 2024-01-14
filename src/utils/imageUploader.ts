import * as cloudinary from 'cloudinary';

// Configure the cloudinary keys 
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
    //!    ########   Configuring the Cloudinary to Upload MEDIA ########
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

/**
 * @Method : Used to upload the image on cloudinary
 * @Author : Yogesh Hasija
 * @Date : 14th January 2024
 */
export const uploadImageOnCloudinary = (file: any, folder: any) => {
    return new Promise(async function (resolve, reject)
  {
    try {
        const options = {
            folder: folder,
        }
        options['resource_type'] = "auto";
        const uploaded = await cloudinaryV2.uploader.upload(file, options);
        return resolve(uploaded);
    }
    catch(error) {
        console.log("Error in file upload on clodinary ==>>> ", error);
        return reject(error);
    }
  });
}


/**
 * @Method : Used to delete the image from cloudinary
 * @Author : Yogesh Hasija
 * @Date : 14th January 2024
 */
export const deleteImageFromCloudinary = (file: any) => {
    return new Promise(async function (resolve, reject)
  {
    try {
        const deleted = cloudinaryV2.uploader.destroy(file);
        return resolve(deleted);
    }
    catch(error) {
        console.log("Error in file delete from cloudinary ==>>> ", error);
        return reject(error);
    }
  });
}


/**
 * @Method : Used to get the url of image uploaded on cloudinary using the image place id
 * @Author : Yogesh Hasija
 * @Date : 14th January 2024
 */
export const getImageUrlFromCloudinary = (file: any) => {
    return new Promise(async function (resolve, reject)
  {
    try {
        const signedImage = cloudinaryV2.url(file);
        return resolve(signedImage);
    }
    catch(error) {
        console.log("Error in getting the image url from cloudinary ==>>> ", error);
        return reject(error);
    }
  });
}