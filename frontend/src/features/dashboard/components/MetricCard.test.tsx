import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("deve renderizar título, valor, subtítulo e tendência", () => {
    render(
      <MetricCard
        title="Sinistros registrados"
        value="42"
        subtitle="Total na base"
        trendText="▲ 12%"
        icon={<span data-testid="icon">icon</span>}
      />,
    );

    expect(screen.getByText("Sinistros registrados")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Total na base")).toBeInTheDocument();
    expect(screen.getByText("▲ 12%")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("deve renderizar skeleton pulse durante isLoading", () => {
    const { container } = render(
      <MetricCard
        title="Sinistros em análise"
        value="10"
        isLoading={true}
        icon={<span>icon</span>}
      />,
    );

    expect(screen.getByText("Sinistros em análise")).toBeInTheDocument();
    expect(screen.queryByText("10")).not.toBeInTheDocument();
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });
});
