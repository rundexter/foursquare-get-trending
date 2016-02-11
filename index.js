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
        var clientId = dexter.environment('FOURSQUARE_CLIENT_ID')
            , clientSecret = dexter.environment('FOURSQUARE_CLIENT_SECRET') 
            , lat = step.input('lat').first()
            , lng = step.input('lng').first()
            , categories = step.input('categories').toArray()
            , self = this
            , foursquare
        ;
        assert(lat);
        assert(lng);
        assert(clientId, 'FOURSQUARE_CLIENT_ID environment variable required');
        assert(clientSecret, 'FOURSQUARE_CLIENT_SECRET environment variable required');
        foursquare = Foursquare({ secrets: {
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUrl: 'http://foo.bar'
        } });
        foursquare.Venues.getTrending(lat, lng, {}, null, function(err, data) {
            if(err) {
                return self.fail(err);
            }
            self.complete(_.compact(_.map(data.venues, function(venue) {
                var primaryCategory = null
                    , isMatch = categories.length === 0
                ;
                _.each(venue.categories, function(category) {
                    if(category.primary) {
                        primaryCategory = category.name;
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
