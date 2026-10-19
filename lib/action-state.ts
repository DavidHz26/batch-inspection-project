import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FLASH_COOKIE, type FlashMessage } from "./flash";
import { ValidationError } from "./validation";

export type ActionState =
  | { status: "success"; message: string }
  | { status: "error"; title: string; message: string }
  | null;

export type FormAction = (state: ActionState, form_data: FormData) => Promise<ActionState>;

export async function runAction(
  operation: () => Promise<unknown>,
  {
    success,
    failure,
    redirect_to,
  }: { success: string; failure: string; redirect_to?: string },
): Promise<ActionState> {
  try {
    await operation();
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", title: "Validation error", message: error.message };
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[action] ${failure}: ${message}`);
    return { status: "error", title: failure, message };
  }

  if (!redirect_to) return { status: "success", message: success };

  const flash: FlashMessage = { variant: "success", message: success };
  (await cookies()).set(FLASH_COOKIE, JSON.stringify(flash), {
    path: "/",
    sameSite: "lax",
    maxAge: 60,
  });
  
  redirect(redirect_to);
}
