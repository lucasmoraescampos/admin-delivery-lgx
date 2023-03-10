import { Component, OnInit, Output, EventEmitter, NgZone, Input } from '@angular/core';

declare const google: any;

@Component({
  selector: 'app-google-autocomplete',
  templateUrl: './google-autocomplete.component.html',
  styleUrls: ['./google-autocomplete.component.scss']
})
export class GoogleAutocompleteComponent implements OnInit {

  @Input() address: string;

  @Input() readonly: boolean = false;

  @Output() changeAddress = new EventEmitter();

  public addressList: string[];

  private googleAutocomplete = new google.maps.places.AutocompleteService();

  private geocoder = new google.maps.Geocoder();

  constructor(
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
  }

  public addressChanged() {

    if (this.address.trim().length < 3) {

      this.addressList = [];

    }

    else {

      this.googleAutocomplete.getPlacePredictions({
        input: this.address
      }, (predictions: any) => {

        this.ngZone.run(() => {

          this.addressList = [];

          if (predictions) {

            predictions.forEach((prediction: any) => {

              this.addressList.push(prediction.description);

            });

          }

        });

      });

    }

  }

  public selectStartAddress(address: string) {

    this.address = address;

    this.addressList = [];

    this.geocoder.geocode({ address: address }, (results: any) => {

      this.changeAddress.emit({
        address: this.address,
        latLng: {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        }
      });

    });

  }

}
