import {
    calculateDeliveryCharge,
    getDeliveryChargeRange,
} from "../utils/deliveryCalculator.js";

const calculateDelivery = async (req, res) => {
    try {
        const { distance, options } = req.body;
        const d = Number(distance);
        if (!Number.isFinite(d) || d < 0) {
            return res.json({
                success: true,
                fee: 0,
                range: { min: 0, max: 0 },
            });
        }

        const fee = calculateDeliveryCharge(d, options || {});
        const range = getDeliveryChargeRange(d);
        res.json({ success: true, fee, range });
    } catch (e) {
        console.error(e);
        res.json({ success: false, message: e.message });
    }
};

export { calculateDelivery };
