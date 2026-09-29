import RentalRequest from "../models/RentalRequest.js";
import Product from "../models/Product.js";

export async function createRentalRequest(req, res) {
  try {
    const { item: itemId, startDate, endDate, message } = req.body;

    const product = await Product.findById(itemId);
    if (!product || !product.isActive) {
      return res.notFound({ error: "Rental item not found" });
    }

    if (product.createdBy.toString() === req.user._id.toString()) {
      return res.badRequest({ error: "You cannot rent your own item" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.badRequest({ error: "End date cannot be before start date" });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const pricePerDay = product.pricePerDay || product.price || 0;
    const totalPrice = totalDays * pricePerDay;
    const securityDeposit = product.securityDeposit || 0;

    const rentalRequest = new RentalRequest({
      item: product._id,
      renter: req.user._id,
      owner: product.createdBy,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay,
      totalPrice,
      securityDeposit,
      message: message || "",
      status: "pending"
    });

    await rentalRequest.save();

    const populated = await RentalRequest.findById(rentalRequest._id)
      .populate("item")
      .populate("owner", "name email phone collegeId collegeName");

    res.created({
      message: "Rental request sent to owner successfully",
      rentalRequest: populated
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getMyRentalRequests(req, res) {
  try {
    const requests = await RentalRequest.find({ renter: req.user._id })
      .populate("item")
      .populate("owner", "name email phone collegeId collegeName")
      .sort({ createdAt: -1 });

    res.ok({
      requests,
      count: requests.length
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getIncomingRentalRequests(req, res) {
  try {
    const requests = await RentalRequest.find({ owner: req.user._id })
      .populate("item")
      .populate("renter", "name email phone collegeId collegeName")
      .sort({ createdAt: -1 });

    res.ok({
      requests,
      count: requests.length
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function acceptRentalRequest(req, res) {
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) {
      return res.notFound({ error: "Rental request not found" });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.forbidden({ error: "Only the item owner can accept this request" });
    }

    request.status = "accepted";
    await request.save();

    const populated = await RentalRequest.findById(request._id)
      .populate("item")
      .populate("renter", "name email phone collegeId collegeName")
      .populate("owner", "name email phone collegeId collegeName");

    res.ok({
      message: "Rental request accepted. The student will be able to view your contact information.",
      rentalRequest: populated
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function rejectRentalRequest(req, res) {
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) {
      return res.notFound({ error: "Rental request not found" });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.forbidden({ error: "Only the item owner can reject this request" });
    }

    request.status = "rejected";
    await request.save();

    res.ok({
      message: "Rental request rejected",
      rentalRequest: request
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function cancelRentalRequest(req, res) {
  try {
    const request = await RentalRequest.findById(req.params.id);
    if (!request) {
      return res.notFound({ error: "Rental request not found" });
    }

    if (request.renter.toString() !== req.user._id.toString()) {
      return res.forbidden({ error: "Only the requester can cancel this request" });
    }

    request.status = "cancelled";
    await request.save();

    res.ok({
      message: "Rental request cancelled",
      rentalRequest: request
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
