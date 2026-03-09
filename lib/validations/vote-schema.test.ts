import { toggleVoteSchema } from "./vote-schema";

describe("toggleVoteSchema", () => {
  it("validates valid reviewId", () => {
    const result = toggleVoteSchema.safeParse({ reviewId: "review-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty reviewId", () => {
    const result = toggleVoteSchema.safeParse({ reviewId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing reviewId", () => {
    const result = toggleVoteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
