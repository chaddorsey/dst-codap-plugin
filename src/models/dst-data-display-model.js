"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DstDataDisplayModel = exports.DstLayerModel = void 0;
exports.isDstDataDisplayModel = isDstDataDisplayModel;
let mobx_state_tree_1 = require("mobx-state-tree");
let dst_data_configuration_model_1 = require("./dst-data-configuration-model");
exports.DstLayerModel = mobx_state_tree_1.types.model("DstLayerModel", {
    layerIndex: mobx_state_tree_1.types.number,
    id: mobx_state_tree_1.types.string,
    dataConfiguration: dst_data_configuration_model_1.DstDataConfigurationModel
});
exports.DstDataDisplayModel = mobx_state_tree_1.types.model("DstDataDisplayModel", {
    layers: mobx_state_tree_1.types.array(exports.DstLayerModel)
})
    .views(function (self) { return ({
    get colorDataConfiguration() {
        return self.layers[0].dataConfiguration;
    },
    get sizeDataConfiguration() {
        return self.layers[1].dataConfiguration;
    }
}); })
    .actions(function (self) { return ({
    placeCanAcceptAttributeIDDrop (place, dataset, attributeID) {
        return false;
    }
}); });
function isDstDataDisplayModel(model) {
    // Currently just checking to make sure it has a colorDataConfiguration property is good enough
    return "colorDataConfiguration" in model;
}
