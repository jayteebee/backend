const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String }, // Added for collection time
    endTime: { type: String }, // Added for collection time
    numberOfCameras: { type: Number, required: true },
    lenses: [{ type: String, required: true }], // Changed to array of strings
    status: { type: String, required: true },
    renter: {
        companyName: { type: String, required: true },
        location: { type: String, required: true },
        contactPerson: { type: String, required: true },
    },
});

module.exports = mongoose.model('Rental', RentalSchema);
