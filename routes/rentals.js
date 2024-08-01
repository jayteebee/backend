const express = require('express');
const router = express.Router();
const axios = require('axios');
const Rental = require('../models/Rental');

const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/18365503/229pfgq/';

// Integrate Google Calendar via Zapier
const sendToZapier = (booking, eventType = 'create') => {
    console.log(booking, "booking")
    const startDateTime = `${booking.startDate.toISOString().split('T')[0]}T${booking.startTime}`;
    const endDateTime = `${booking.endDate.toISOString().split('T')[0]}T${booking.endTime}`;
    
    const data = {
        ...booking._doc,
        eventType,
        startDateTime,
        endDateTime,
        title: `TVE: ${booking.numberOfCameras} kits - ${booking.renter.companyName} - ${booking.renter.contactPerson}`,
        description: `Lenses: ${booking.lenses.join(', ')}\nLocation: ${booking.renter.location}`
    };

    axios.post(zapierWebhookUrl, data)
        .then(response => {
            console.log('Sent to Zapier:', response.data);
        })
        .catch(error => {
            console.error('Error sending to Zapier:', error);
        });
};


// Create a new rental
router.post('/', async (req, res) => {
    const rental = new Rental(req.body);
    try {
        const savedRental = await rental.save();
        sendToZapier(savedRental);  
        res.status(201).json(savedRental);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Get all rentals
router.get('/', async (req, res) => {
    try {
        const rentals = await Rental.find();
        res.json(rentals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a rental by ID
router.get('/:id', async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        res.json(rental);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a rental
router.put('/:id', async (req, res) => {
    try {
        const updatedRental = await Rental.findByIdAndUpdate(req.params.id, req.body, { new: true });
        sendToZapier(updatedRental, 'update');  // Send updated booking info to Zapier
        res.json(updatedRental);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete a rental
router.delete('/:id', async (req, res) => {
    try {
        await Rental.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rental deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get available cameras for a date range
router.post('/availability', async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
        const rentals = await Rental.find({
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        const totalCameras = 5; 
        const rentedCameras = rentals.reduce((acc, rental) => acc + rental.numberOfCameras, 0);

        const availableCameras = totalCameras - rentedCameras;

        // Find the earliest return
        const today = new Date();
        const upcomingReturns = rentals
            .filter(rental => new Date(rental.endDate) > today)
            .map(rental => ({
                daysUntilReturn: Math.ceil((new Date(rental.endDate) - today) / (1000 * 60 * 60 * 24)),
                numberOfCameras: rental.numberOfCameras,
                companyName: rental.renter.companyName,
                location: rental.renter.location
            }))
            .sort((a, b) => a.daysUntilReturn - b.daysUntilReturn);

        res.json({ availableCameras, upcomingReturns });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
