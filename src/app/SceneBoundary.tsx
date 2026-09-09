import { Component, type ReactNode } from "react";
import { useExperience } from "../stores/experience";

export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useExperience.getState().failRenderer();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
