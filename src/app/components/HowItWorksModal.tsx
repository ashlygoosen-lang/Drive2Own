import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Check, Car, Shield, TrendingUp, Key, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            Driver Vehicle Ownership Stokvel
          </DialogTitle>
          <p className="text-center text-gray-600">
            Empowering active Uber, Bolt, and InDrive drivers to own their own vehicle — the stokvel way.
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {/* What is a Stokvel */}
            <AccordionItem value="what-is-stokvel" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    ?
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">What is a Stokvel?</h3>
                    <p className="text-sm text-gray-500 mt-1">Learn about this traditional South African savings model</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-gray-600 pl-14">
                  <p>
                    A stokvel (or stockvel) is a traditional South African community savings group. Members contribute a fixed amount regularly into a shared pool. The funds are then used or distributed on a rotating or agreed basis — helping people access lump sums for big goals without banks, high interest, or debt.
                  </p>
                  <p>
                    This model builds trust, discipline, and mutual support. In South Africa, millions participate in stokvels, managing billions of rands yearly — often for groceries, funerals, education, or investments. <strong>Ours is an investment stokvel focused on one powerful goal: vehicle ownership for ride-hailing drivers.</strong>
                  </p>
                  <div className="bg-green-50 border-l-4 border-[#00C853] p-4 rounded">
                    <p className="font-medium text-gray-800">
                      💡 Owning your car means saying goodbye to expensive rentals (which can eat 30–50% of your weekly earnings). You keep more of every trip and build real wealth.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Who Can Join */}
            <AccordionItem value="who-can-join" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Who Can Join?</h3>
                    <p className="text-sm text-gray-500 mt-1">Requirements for joining the stokvel</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pl-14 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Eligibility Requirements</h4>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#00C853] mt-0.5 flex-shrink-0" />
                        <span>Active, verified drivers on Uber, Bolt, or InDrive with a good standing profile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#00C853] mt-0.5 flex-shrink-0" />
                        <span>Must commit to contributing <strong>R2,500 every week</strong> (on time — peer accountability keeps things reliable)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#00C853] mt-0.5 flex-shrink-0" />
                        <span>Membership by invitation or approval only — we keep groups trustworthy and driver-focused</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Three Separate Groups</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          102
                        </div>
                        <div>
                          <p className="font-medium">Uber Drivers Group</p>
                          <p className="text-sm text-gray-600">102 members</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          102
                        </div>
                        <div>
                          <p className="font-medium">Bolt Drivers Group</p>
                          <p className="text-sm text-gray-600">102 members</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          102
                        </div>
                        <div>
                          <p className="font-medium">InDrive Drivers Group</p>
                          <p className="text-sm text-gray-600">102 members</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 text-center pt-2">
                        Total: 306 members across all groups
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* How It Works - Process */}
            <AccordionItem value="process" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    1-5
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">How Contributions & Vehicle Purchases Work</h3>
                    <p className="text-sm text-gray-500 mt-1">5-step process from contribution to vehicle ownership</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pl-14 space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Weekly Contribution</h4>
                      <p className="text-gray-600">Every member pays R2,500 into the group fund.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Weekly Pool</h4>
                      <p className="text-gray-600">
                        With 102 members per group × R2,500 = approximately <strong className="text-[#00C853]">R255,000 per group</strong> (before minimal admin costs).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Vehicle Purchases</h4>
                      <p className="text-gray-600">
                        <strong>2 vehicles are bought every single week</strong> using the pooled funds.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Fair Rotation</h4>
                      <p className="text-gray-600">
                        The 2 vehicles go to 2 members that week. Allocation follows a fair rotation or agreed schedule in our simple constitution (no favoritism).
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold">
                        5
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Important Rule</h4>
                      <p className="text-gray-600">
                        <strong>Each driver gets only one car per year.</strong> This ensures fairness, gives everyone a realistic chance, and prevents anyone from dominating the rotation.
                      </p>
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      Example
                    </h4>
                    <p className="text-gray-700">
                      If your name comes up in Week 5, you receive a reliable, platform-approved vehicle (e.g., something like a <strong>Toyota Etios, VW Polo Vivo, or Suzuki Dzire</strong> — fuel-efficient and low-maintenance for long hours on the road). 
                      You pay nothing extra — no interest, no loan. You keep contributing weekly to help the next drivers, just like others helped you.
                    </p>
                    <p className="text-gray-700 mt-3">
                      Over time, the rotation cycles through the group, helping dozens of members achieve ownership each year.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Benefits */}
            <AccordionItem value="benefits" className="border rounded-lg bg-white">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    ★
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Why This Works So Well for Ride-Hailing Drivers</h3>
                    <p className="text-sm text-gray-500 mt-1">Key benefits and advantages of the stokvel model</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pl-14 grid md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <Shield className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">No bank debt or credit checks</h4>
                      <p className="text-sm text-gray-600">Pure community power — no loan sharks or high interest rates.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <TrendingUp className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Stop renting, start earning more</h4>
                      <p className="text-sm text-gray-600">Many drivers pay R1,500–R3,000+ weekly just to rent a car. Ownership puts that money back in your pocket.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Car className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Vehicles chosen for the job</h4>
                      <p className="text-sm text-gray-600">Reliable, fuel-sipping models approved by Uber/Bolt/InDrive with low running costs and strong resale value.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Check className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Trust & accountability</h4>
                      <p className="text-sm text-gray-600">Fellow drivers run the show. Regular check-ins and a clear constitution keep contributions flowing and defaults rare.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Key className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Build real assets</h4>
                      <p className="text-sm text-gray-600">Your car becomes income-generating property that can support your family long-term.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Proven traditional model</h4>
                      <p className="text-sm text-gray-600">Millions of South Africans trust stokvels — managing billions of rands yearly with success.</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-[#00C853] to-[#00a843] text-white border-0 mt-6">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-3">Ready to Own Your Ride?</h3>
              <p className="text-green-50 mb-4">
                If you're hustling daily on Uber, Bolt, or InDrive and tired of rental fees eating your profits, this stokvel changes the game.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/join" onClick={() => onOpenChange(false)}>
                  <Button size="lg" className="bg-white text-[#00C853] hover:bg-gray-100">
                    Check Eligibility & Join
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => onOpenChange(false)}
                >
                  Contact Us
                </Button>
              </div>
              <p className="text-sm text-green-100 mt-4">
                Contribute weekly. Rotate fairly. Own your car. One stokvel, one vehicle at a time — driving independence for Mzansi's drivers.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
