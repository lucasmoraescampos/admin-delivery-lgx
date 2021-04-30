import {MetaReducer, ActionReducerMap} from '@ngrx/store';
import {AppState} from '../states';
import {environment} from '../../../environments/environment';
import {TicketBookingReducer} from './ticket-booking.reducer';

export const reducers: ActionReducerMap<AppState> = {
  ticketBooking: TicketBookingReducer
};

export const metaReducers: MetaReducer<any>[] = !environment.production ? [] : [];
