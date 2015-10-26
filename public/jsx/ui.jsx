var GroupSelector = React.createClass({

    onChange: function(item) {
        var self = this;
        return function(e) {
            if (self.props.onChange)
               self.props.onChange(self, item);
        }
    },
    
    render: function() {
        var items = this.props.items;
        var self = this;
        return <div className="form-group">
            <label className="col-sm-1 control-label">{this.props.label}:</label>
              <div>
              {items.map(function(item) {
                  return <label key={item._id} className="checkbox-inline">
                           <input type="checkbox" value={item._id}
                                  checked={item.selected}
                                  onChange={self.onChange(item)} />
                           {item.name}
                         </label>;
              })}
              </div>
            </div>;
    }
});

var Filters = React.createClass({
    getInitialState: function() {
        return {
          years: [],
          quarters: [],
          regions: [],
          industries: [],
          products: [],
          sales: []
        };
    },

    onChange: function(selector, item) {
        var key = selector.props.id;
        var items = this.state[selector.props.id];
        for (var i = 0; i < items.length; i++) {
          if (items[i]._id == item._id) {
            items[i].selected = !items[i].selected;
            break;
          }
        }
        var state = {};
        state[key] = items;
        this.setState(state);

        if (this.props.onChange) {
          this.props.onChange(this.state);
        }
    },
    
    render: function() {
      return <form className="form-horizontal">
        <GroupSelector id="years" label="Years" onChange={this.onChange}
                       items={this.state.years} />
        <GroupSelector id="regions" label="Regions" onChange={this.onChange}
                       items={this.state.regions} />
        <GroupSelector id="industries" label="Industries" onChange={this.onChange}
                       items={this.state.industries} />
        <GroupSelector id="products" label="Products" onChange={this.onChange}
                       items={this.state.products} />
        <GroupSelector id="sales" label="Sales Reps" onChange={this.onChange}
                       items={this.state.sales} />
      </form>;
    }
});

function setupUI(data, change) {
    var mapToObj = function(val) {
        return {_id: val, name: val, selected: true};
    };
    var setSelected = function(val) {
        val.selected = true;
        return val;
    };
    var getSelectedIds = function(items) {
        return items.filter(function(item) { return item.selected; })
                    .map(function(item) { return item._id; });
    };
    var onChange = function(state) {
        change({
          years: getSelectedIds(state.years),
          products: getSelectedIds(state.products),
          industries: getSelectedIds(state.industries),
          regions: getSelectedIds(state.regions),
          sales: getSelectedIds(state.sales)
        })
    };
    var filters = React.render(
        <Filters onChange={onChange} />,
        $("#filters").get(0)
    );
    filters.setState({
      years: data.years.map(mapToObj),
      industries: data.industries.map(setSelected),
      regions: data.regions.map(setSelected),
      sales: data.sales_reps.map(setSelected),
      products: data.products.map(setSelected)
    });
    onChange(filters.state);
}
