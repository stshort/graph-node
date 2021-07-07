import { store } from '@graphprotocol/graph-ts';
import {
  BookingAdded,
  BookingApproved,
  BookingCanceled,
  ProfileCreatedOrUpdated,
  ProfileRemoved
} from "../generated/BookIt/BookIt";
import {Booking, Customer, Profile} from '../generated/schema'

export function handleProfileCreatedOrUpdated(event: ProfileCreatedOrUpdated): void {
  const eventProfile = event.params.profile;
  let id = eventProfile.owner.toHex();
  let profile = Profile.load(id);
  if (profile == null) {
    profile = new Profile(id);
  }
  profile.owner = eventProfile.owner;
  profile.rate = eventProfile.rate;
  profile.canBookMon = eventProfile.canBookMon;
  profile.canBookTue = eventProfile.canBookTue;
  profile.canBookWed = eventProfile.canBookWed;
  profile.canBookThur = eventProfile.canBookThur;
  profile.canBookFri = eventProfile.canBookFri;
  profile.canBookSat = eventProfile.canBookSat;
  profile.canBookSun = eventProfile.canBookSun;
  profile.save();
}

export function handleProfileRemoved(event: ProfileRemoved): void {
  const id = event.params.owner.toHex();
  let profile = Profile.load(id);
  if (profile != null) {
    store.remove('Profile', id);
  }
}

export function handleBookingAdded(event: BookingAdded): void {
  const eventBooking = event.params.booking;
  let id = eventBooking.id.toHex();
  let booking = new Booking(id);
  let customerId = eventBooking.customer.toHex();
  let customer = Customer.load(customerId);

  // If this is the first booking a customer has made, save them to the graph
  if (customer == null) {
    customer = new Customer(customerId);
    customer.save();
  }

  booking.profile = eventBooking.serviceProvider.toHex();
  booking.customer = customerId;
  booking.createdAt = eventBooking.createdAt;
  booking.start = eventBooking.start;
  booking.end = eventBooking.end;
  booking.amountPaid = eventBooking.amountPaid;
  booking.approved = eventBooking.approved;
  booking.save();

  let profile = Profile.load(eventBooking.serviceProvider.toHex());
  if (profile != null) {
    let bookings = profile.bookings || [];
  }
}

export function handleBookingApproved(event: BookingApproved): void {
  const eventBooking = event.params.booking;
  let id = eventBooking.id.toHex();
  let booking = Booking.load(id);
  if (booking == null) {
    return;
  }

  booking.approved = true;
  booking.save();
}

export function handleBookingCanceled(event: BookingCanceled): void {
  const bookingId = event.params.bookingId;
  store.remove('Booking', bookingId.toHex());
}
