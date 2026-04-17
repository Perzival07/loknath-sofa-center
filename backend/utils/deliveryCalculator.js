/**
 * Delivery charge calculation (authoritative copy — keep in sync with API contract).
 * @see POST /api/delivery/calculate
 */

export const calculateDeliveryCharge = (distance, options = {}) => {
    const {
        floor = 0,
        hasElevator = true,
        needDismantling = false,
        needPacking = false,
    } = options;

    if (!distance || distance < 0) {
        return 0;
    }

    const baseFare = 425;
    const perKmRate = 37.5;
    const transportCost = baseFare + distance * perKmRate;
    const baseLaborCost = 1150;

    let floorCharges = 0;
    if (!hasElevator && floor > 0) {
        const perFloorCharge = 250;
        floorCharges = floor * perFloorCharge;
    }

    const dismantlingCost = needDismantling ? 1000 : 0;
    const packingCost = needPacking ? 650 : 0;

    return Math.round(
        transportCost +
            baseLaborCost +
            floorCharges +
            dismantlingCost +
            packingCost
    );
};

export const getDeliveryChargeRange = (distance) => {
    if (!distance || distance < 0) {
        return { min: 0, max: 0 };
    }

    const minBaseFare = 350;
    const minPerKmRate = 30;
    const minLaborCost = 800;
    const minTotal = Math.round(
        minBaseFare + distance * minPerKmRate + minLaborCost
    );

    const maxBaseFare = 500;
    const maxPerKmRate = 45;
    const maxLaborCost = 1500;
    const maxFloorCharges = 300 * 5;
    const maxDismantlingCost = 1200;
    const maxPackingCost = 800;
    const maxTotal = Math.round(
        maxBaseFare +
            distance * maxPerKmRate +
            maxLaborCost +
            maxFloorCharges +
            maxDismantlingCost +
            maxPackingCost
    );

    return { min: minTotal, max: maxTotal };
};
