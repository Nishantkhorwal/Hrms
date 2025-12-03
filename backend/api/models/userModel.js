import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  site: {
  type: String,
  enum: ["Insignia Park-1", "Insignia Park-2", "Pravasa", "Sukoon", "I-City", "Ambliss","Dlf Phase-1", "Wazirpur", "Hayatpur", "Head Office"],
  required: function () {
    return this.role === 'User';   // ✅ site required ONLY for Normal Users
  }
},
  role: { 
    type: String, 
    enum: ['SuperAdmin', 'Admin', 'User'],
    default: 'User' 
  },
}, { timestamps: true });


const HrmsModel = mongoose.model('HrmsModel', userSchema);
export default HrmsModel;