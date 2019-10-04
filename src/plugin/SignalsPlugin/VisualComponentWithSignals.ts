// import applyMixins from "mixins-may-apply";
import VisualComponent from "../../VisualComponent";
import SignalsTrait from "./SignalsTrait";

interface VisualComponentWithSignals extends VisualComponent, SignalsTrait {};

abstract class VisualComponentWithSignals extends VisualComponent {}

export default VisualComponentWithSignals;

// applyMixins(VisualComponentWithSignals, [SignalsTrait]);