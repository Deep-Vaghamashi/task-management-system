"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side: Brand */}
            <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 font-bold text-xl">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                            DL
                        </div>
                        <span className="text-xl tracking-tight">Daily Life</span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <blockquote className="space-y-2 border-l-2 border-violet-500/50 pl-4">
                        <p className="text-sm font-medium leading-relaxed text-zinc-300">
                            &quot;Transparency builds trust. We believe in keeping our policies clear and straightforward.&quot;
                        </p>
                        <footer className="text-xs text-zinc-500">— Daily Life Team</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Content */}
            <div className="flex flex-1 flex-col p-8 bg-background relative transition-colors duration-300 overflow-y-auto">
                <div className="absolute top-4 right-4 md:top-8 md:right-8">
                    <ModeToggle />
                </div>

                <div className="w-full max-w-2xl mx-auto py-8">
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back to Register
                    </Link>

                    <h1 className="text-3xl font-bold tracking-tight mb-2">Terms & Conditions</h1>
                    <p className="text-sm text-muted-foreground mb-6">Last updated: February 28, 2026</p>
                    <Separator className="mb-8" />

                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using Daily Life (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Account Registration</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding the password that you use to access the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. Use of Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 ml-4">
                                <li>Use the Service in any way that violates applicable laws or regulations</li>
                                <li>Attempt to gain unauthorized access to any part of the Service</li>
                                <li>Use the Service to transmit any harmful or malicious code</li>
                                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Data & Privacy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Your privacy is important to us. Any personal data you provide through the Service will be handled in accordance with our Privacy Policy. We collect and use your data solely for the purpose of providing and improving the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                The Service and its original content, features, and functionality are and will remain the exclusive property of Daily Life and its licensors. The Service is protected by copyright, trademark, and other laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                In no event shall Daily Life, its directors, employees, partners, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about these Terms, please contact us at{" "}
                                <span className="text-primary font-medium">support@dailylife.app</span>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
