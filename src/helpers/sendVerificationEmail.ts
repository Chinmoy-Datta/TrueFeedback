import { resend } from "@/lib/resend";

import VerificationEmail from "../../emails/VerificationEmail";

import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "TrueFeedback <truefeedback@resend.dev>",
      to: email,
      subject: "True feedback | Verification code",
      react: VerificationEmail({ username: username, otp: verifyCode }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, message: "Failed to send email" };
    }

    return { success: true, message: "Verification email send successfully" };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
