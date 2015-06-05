// Create store
//
// Stores responsibilities:
//
// - (Pre)fetch data from backend
// - Cache data
// - Offline support (in the future)
//
var createStore = function() {
  var dataNeed = {};

  return {
    prefetch: function(name, collection, entity, children) {
      dataNeed[name] = {
        collection: collection,
        entity: entity,
        childrenNames: children,
        children: [], // empty at this point
        parentName: null // unknown at this point
      };
    },

    componentTraverseDone: function(clbk) {
      _.forEach(dataNeed, function(spec, name) {
        spec.children = _.reduce(spec.childrenNames, function(memo, childName) {
          memo[childName] = dataNeed[childName];
          memo[childName].parentName = name;
          return memo;
        }, {});
      });

      // Leave only the root node to top-level
      dataNeed = _.filter(dataNeed, function(spec) {
        return spec.parentName === null;
      });
    },

    load: function(clbk) {
      console.log("Load data according to the component data need");
      console.log(dataNeed);

      // TODO Load
      // (Simulate network latency with timeout)
      setTimeout(clbk, 1000);
    }
  };
};

// Create RLY
//
// Responsibilities
//
// - Wrap all React components
// - Read the component data need from the metadata
// - Tell Store to prefetch the needed data
//
var createRLY = function(store) {
  var createContainer = function(spec) {
    var name = spec.name; // for debugging purposes
    var children = spec.children || [];
    var entity = spec.entity;
    var collection = spec.collection;
    var Component = spec.component;

    store.prefetch(name, collection, entity, children);

    return React.createClass({
      render: function() {
        return (
            <Component />
        );
      }
    });
  };

  return {
    createContainer: createContainer
  };
};

var store = createStore();
var RLY = createRLY(store);

var UserHeader = RLY.createContainer({
  name: "UserHeader",
  entity: {
    person: ["firstName", "lastName", "avatarUrl"]
  },
  component: React.createClass({
    render: function() {
      return (
          <p>User header component will be here. It contains the name and avatar of the current user</p>
      );
    }
  })
});

var ListingGrid = RLY.createContainer({
  name: "ListingGrid",
  collection: {
    listing: {
      fields: ["id"],
      query: {
        count: 5
      }
    }
  },
  children: ["ListingCard"],
  component: React.createClass({
    render: function() {
      return (
          <ListingCard/>
      );
    }
  })
});

var ListingCard = RLY.createContainer({
  name: "ListingCard",
  entity: {
    listing: {
      fields: ["title", "description", "author_id"]
    }
  },
  component: React.createClass({
    render: function() {
      return (
          <p>ListingCards will be here. It will contain listing title, description, image and author information</p>
      );
    }
  })
});

var App = RLY.createContainer({
  name: "App",
  entity: {
    community: {
      fields: ["id"]
    },
    person: {
      fields: ["id"]
    }
  },
  children: ["UserHeader", "ListingGrid"],
  component: React.createClass({
    render: function() {
      return (
          <div>
          <p>Application</p>
          <UserHeader/>
          <ListingGrid/>
          </div>
      );
    }
  })
});

console.log("Traverse component tree and figure out the data need");

var app = React.createElement(App);

console.log("Store now knows what data each component need");

store.componentTraverseDone();

console.log("Now load the initial data");

store.load(function() {
  console.log("The data is now loaded");

  console.log("Call render for the first time");
  React.render(app, document.getElementById('container'));
});
