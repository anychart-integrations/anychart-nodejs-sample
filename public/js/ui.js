"use strict";

var GroupSelector = React.createClass({
    displayName: "GroupSelector",

    onChange: function onChange(item) {
        var self = this;
        return function (e) {
            if (self.props.onChange) self.props.onChange(self, item);
        };
    },

    render: function render() {
        var items = this.props.items;
        var self = this;
        return React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
                "label",
                { className: "col-sm-1 control-label" },
                this.props.label,
                ":"
            ),
            React.createElement(
                "div",
                null,
                items.map(function (item) {
                    return React.createElement(
                        "label",
                        { key: item._id, className: "checkbox-inline" },
                        React.createElement("input", { type: "checkbox", value: item._id,
                            checked: item.selected,
                            onChange: self.onChange(item) }),
                        item.name
                    );
                })
            )
        );
    }
});

var Filters = React.createClass({
    displayName: "Filters",

    getInitialState: function getInitialState() {
        return {
            quarters: [],
            regions: [],
            industries: [],
            products: [],
            sales: []
        };
    },

    onChange: function onChange(selector, item) {
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

    render: function render() {
        return React.createElement(
            "form",
            { className: "form-horizontal" },
            React.createElement(GroupSelector, { id: "regions", label: "Regions", onChange: this.onChange,
                items: this.state.regions }),
            React.createElement(GroupSelector, { id: "industries", label: "Industries", onChange: this.onChange,
                items: this.state.industries }),
            React.createElement(GroupSelector, { id: "products", label: "Products", onChange: this.onChange,
                items: this.state.products }),
            React.createElement(GroupSelector, { id: "sales", label: "Sales Reps", onChange: this.onChange,
                items: this.state.sales })
        );
    }
});

function setupUI(data, change) {
    var mapToObj = function mapToObj(val) {
        return { _id: val, name: val, selected: true };
    };
    var setSelected = function setSelected(val) {
        val.selected = true;
        return val;
    };
    var getSelectedIds = function getSelectedIds(items) {
        return items.filter(function (item) {
            return item.selected;
        }).map(function (item) {
            return item._id;
        });
    };
    var onChange = function onChange(state) {
        change({
            products: getSelectedIds(state.products),
            industries: getSelectedIds(state.industries),
            regions: getSelectedIds(state.regions),
            sales: getSelectedIds(state.sales)
        });
    };
    var filters = React.render(React.createElement(Filters, { onChange: onChange }), $("#filters").get(0));
    filters.setState({
        industries: data.industries.map(setSelected),
        regions: data.regions.map(setSelected),
        sales: data.sales_reps.map(setSelected),
        products: data.products.map(setSelected)
    });
    onChange(filters.state);
}