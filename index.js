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
        var credentials = dexter.provider('foursquare').credentials()
            , clientId = (credentials) ? credentials.client_id : dexter.environment('FOURSQUARE_CLIENT_ID')
            , clientSecret = (credentials) ? credentials.client_secret : dexter.environment('FOURSQUARE_CLIENT_SECRET') 
            , accessToken = (credentials) ? credentials.access_token : dexter.environment('FOURSQUARE_ACCESS_TOKEN')
            , lat = step.input('lat').first()
            , lng = step.input('lng').first()
            , categories = step.input('categories').toArray()
            , limit = step.input('limit', 25).first()
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
        foursquare.Venues.getTrending(lat, lng, { limit: 50 }, null, function(err, data) {
            if(err) {
                return self.fail(err);
            }
            var results = _.compact(_.map(data.venues, function(venue) {
                var primaryCategory = null
                    , isMatch = categories.length === 0
                ;
                _.each(venue.categories, function(category) {
                    if(category.primary) {
                        primaryCategory = category.name;
                    }
                    if(categories.length > 0 && _.indexOf(categories, category.name) >= 0) {
                        isMatch = true;
                    }
                });
                //console.log('Matching', primaryCategory, '?', isMatch, 'checked', categories.length);

                return (isMatch) ? {
                    venue_id: venue.id
                    , address: venue.location.formattedAddress.join(' ')
                    , url: venue.url
                    , name: venue.name
                    , category: primaryCategory
                } : null;
            }));
            if(results.length > limit) {
                self.complete(results.slice(0, limit));
            } else {
                self.complete(results);
            }
        });
    }
};
