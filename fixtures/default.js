var _ = require('lodash')
    , env = require('./env')
    ;

module.exports = _.merge({
    instance_id: 'local_test_instance'
    , instance_state: {
        active_step :  "local_test_step"
    }
    , workflow: {
        "id" : "local_test_workflow"
        , "title": "Local test workflow"
        , "description": "A fixture workflow used to test a module"
    }
    , steps: {
        local_test_step: {
            id: 'local_test_step'
            , type: 'module'
            //The test runner will change YOUR_MODULE_NAME to the correct module name
            , name: 'YOUR_MODULE_NAME'
            , next: []
        }
    }
    , modules: {
        //The test runner will add the proper data here
    }
    , data: {
        local_test_step: {
            /*
             * You should update this section with some test input for testing your module
             */
            input: {
                //Replace VAR1 with the name of an expected input, and add more inputs as needed.
                lat: 40.7,
                lng: -74
            }
        }
    }
}, env);
