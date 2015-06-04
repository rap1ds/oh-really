var store = (function() {
  var prefetchedInfo = {};
  var info = {};

  return {
    prefetch: function(name, collection, entity, children) {
      prefetchedInfo[name] = {
        collection: collection,
        entity: entity,
        childrenNames: children,
        children: [], // empty at this point
        parentName: null // unknown at this point
      };
    },
    renderDone: function() {
      _.forEach(prefetchedInfo, function(spec, name) {
        spec.children = _.reduce(spec.childrenNames, function(memo, childName) {
          memo[childName] = prefetchedInfo[childName];
          memo[childName].parentName = name;
          return memo;
        }, {});
      });
      prefetchedInfo = _.filter(prefetchedInfo, function(spec) {
        return spec.parentName === null;
      });
    },
    load: function() {
      debugger;
    }
  };
})();

var createRLY = function(store) {
  var createContainer = function(spec) {
    debugger;
    var name = spec.name; // for debugging purposes
    var children = spec.children || [];
    var entity = spec.entity;
    var collection = spec.collection;
    var Component = spec.component;

    store.prefetch(name, collection, entity, children);

    return React.createClass({
      render: function() {
        return <Component />
      }
    });
  };

  return {
    createContainer: createContainer
  };
};

var RLY = createRLY(store);

var UserHeader = RLY.createContainer({
  name: "UserHeader",
  data: {
    person: ["firstName", "lastName", "avatarUrl"]
  },
  component: React.createClass({
    render: function() {
      return (
        <p>User header</p>
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
          <p>ListingCard</p>
      );
    }
  })
});

var App = RLY.createContainer({
  name: "App",
  entity: {
    community: {
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

React.render(<App />, document.getElementById('container'));
store.renderDone();
store.load();
