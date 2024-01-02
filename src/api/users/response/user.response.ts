export class UserResponse
{
  id: any;
  firstName: any;
  lastName: any;
  email: any;
  countryCode: any;
  phone: any;
  password: any;
  location: any;
  address: any;
  profileImage: any;
  userType: any;
  createdAt: any;
  updatedAt: any;

  constructor(instance: any)
  {
    this.id = instance._id ? instance._id : "",
    this.firstName = instance.firstName ? instance.firstName : "",
    this.lastName = instance.lastName ? instance.lastName : "",
    this.countryCode = instance.countryCode ? instance.countryCode : "",
    this.phone = instance.phone ? instance.phone : "",
    this.password = instance.password ? instance.password : "",
    this.location = instance.location ? instance.location : {},
    this.address = instance.address ? instance.address : "",
    this.profileImage = instance.profileImage ? instance.profileImage : "",
    this.userType = instance.userType ? instance.userType : "",
    this.createdAt = instance.createdAt ? instance.createdAt : "",
    this.updatedAt = instance.updatedAt ? instance.updatedAt : ""
  }
}