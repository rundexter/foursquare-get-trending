var _ = require('lodash')
    , Foursquare = require('node-foursquare')
    , assert = require('assert')
;
module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var creds = dexter.provider('foursquare').credentials()
            , foursquare = Foursquare({ secrets: {
                clientId: creds.client_id,
                clientSecret: creds.client_secret,
                redirectUrl: 'http://foo.bar'
            } })
            , lat = step.input('lat').first()
            , lon = step.input('lon').first()
            , categories = step.input('categories').toArray()
            , self = this
        ;
        assert(lat);
        assert(lon);
        foursquare.Venues.getTrending(lat, lon, {}, null, function(err, data) {
            if(err) return self.fail(err);
            self.complete(_.compact(_.map(data.venues, function(venue) {
                var primaryCategory = null
                    , isMatch = categories.length === 0
                ;
                _.each(venue.categories, function(category) {
                    if(category.primary) {
                        primaryCategory = category.name
                    }
                    if(categories.length > 0 && categories.indexOf(category.name) === 0) {
                        isMatch = true;
                    }
                });

                return (isMatch) ? {
                    venue_id: venue.id
                    , address: venue.location.formattedAddress.join(' ')
                    , url: venue.url
                    , name: venue.name
                    , category: primaryCategory
                } : null;
            })));
        });
    }
};
