import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { CardWithMetadata } from "@phyt/types";

interface SellModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: CardWithMetadata;
}

type OrderBookEntry = {
    price: number;
    quantity: number;
};

type ExpirationOption = {
    value: string;
    label: string;
    hours: number;
};

const expirationOptions = [
    { value: '1', label: '1 Hour' },
    { value: '3', label: '3 Hours' },
    { value: '6', label: '6 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '1 Day' },
    { value: '72', label: '3 Days' },
    { value: '168', label: '7 Days' },
];

const dummyOrders: OrderBookEntry[] = [
    { price: 0.008, quantity: 2 },
    { price: 0.007, quantity: 1 },
    { price: 0.006, quantity: 3 },
    { price: 0.005, quantity: 1 }
];

export const SellModal = ({ isOpen, onClose, card }: SellModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-phyt_bg w-full max-w-md">
                <DialogTitle className="text-center text-white">Sell Card</DialogTitle>

                {/* Card Image */}
                <div className="flex justify-center">
                    <Image
                        src={card.metadata.image_url}
                        alt={`Card ${card.metadata.token_id}`}
                        width={100}
                        height={150}
                        className="rounded-lg"
                    />
                </div>

                {/* Order Book */}
                <div className="bg-black p-4 rounded-lg border border-gray-800">
                    <table className="w-full text-sm text-white">
                        <thead>
                            <tr className="text-phyt_text_secondary border-b border-gray-800">
                                <th className="text-left py-2">Price (ETH)</th>
                                <th className="text-right py-2">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyOrders.length > 0 ? (
                                dummyOrders.map((order, index) => (
                                    <tr
                                        key={index}
                                        className={`
                            ${index % 2 === 0 ? 'bg-black' : 'bg-gray-900'}
                            hover:bg-gray-800
                        `}
                                    >
                                        <td className="py-2">{order.price}</td>
                                        <td className="text-right py-2">{order.quantity}</td>
                                    </tr>
                                ))
                            ) : (
                                // Empty state - 4 blank rows
                                Array.from({ length: 4 }).map((_, index) => (
                                    <tr
                                        key={index}
                                        className={`
                            ${index % 2 === 0 ? 'bg-black' : 'bg-gray-900'}
                        `}
                                    >
                                        <td className="py-2">&nbsp;</td>
                                        <td className="py-2">&nbsp;</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Listing Controls */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            type="number"
                            placeholder="Price (ETH)"
                            className="bg-black border-gray-800"
                        />
                        <Select>
                            <SelectTrigger className="bg-black border-gray-800 text-white">
                                <SelectValue placeholder="Expiration" />
                            </SelectTrigger>
                            <SelectContent>
                                {expirationOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button className="bg-phyt_blue hover:bg-phyt_blue/80">
                            List
                        </Button>
                    </div>

                    <Button className="w-full border-gray-800 bg-black hover:bg-gray-800">
                        Accept Highest Bid (0.005 ETH)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};