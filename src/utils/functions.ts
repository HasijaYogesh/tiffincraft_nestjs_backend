
export const getUserName = (userData: any) => {
    return (
        userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}`
        : userData.firstName ? userData.firstName 
        : userData.lastName ? userData.lastName
        : userData.email ? userData.email
        : ""
    );
}

export const generateOtp = (num: any) => {
    // Declare a digits variable
    // which stores all digits
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < num; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}