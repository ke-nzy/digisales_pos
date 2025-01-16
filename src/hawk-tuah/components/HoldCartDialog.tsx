import React, { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';

// API response types
interface HoldReasonsResponse {
    status: 'SUCCESS' | 'FAILED';
    data: HoldReason[];
    message?: string;
}

interface HoldReason {
    id: string;
    reason_description: string;
    dissallow_invoicing: '0' | '1';
}

interface HoldCartDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedReasons: string[]) => Promise<void>;
    siteUrl: string;
    companyPrefix: string;
    isLoading?: boolean | undefined;
}

const HoldCartDialog: React.FC<HoldCartDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    siteUrl,
    companyPrefix,
    isLoading = false
}) => {
    const [holdReasons, setHoldReasons] = useState<HoldReason[]>([]);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [fetchingReasons, setFetchingReasons] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            void fetchHoldReasons();
        }
    }, [isOpen, siteUrl, companyPrefix]); 

    const fetchHoldReasons = async (): Promise<void> => {
        setFetchingReasons(true);
        setError(null);
        try {
            const form = new FormData();
            form.append("tp", "getHeldCartReasons");
            form.append("cp", companyPrefix);

            const response = await fetch(`${siteUrl}process.php`, {
                method: 'POST',
                body: form
            });

            const result = await response.json() as HoldReasonsResponse;

            if (result.status === "SUCCESS" && Array.isArray(result.data)) {
                setHoldReasons(result.data);
            } else {
                setError(result.message || "Failed to load hold reasons");
            }
        } catch (e) {
            setError("Failed to fetch hold reasons");
            console.error('Error fetching hold reasons:', e);
        } finally {
            setFetchingReasons(false);
        }
    };

    const handleCheckboxChange = (reason: HoldReason) => {
        setSelectedReasons(prev => {
            if (prev.includes(reason.reason_description)) {
                return prev.filter(desc => desc !== reason.reason_description);
            } else {
                return [...prev, reason.reason_description];
            }
        });
    };

    const handleConfirm = async (): Promise<void> => {
        if (selectedReasons.length === 0) {
            setError("Please select at least one reason");
            return;
        }
        await onConfirm(selectedReasons);
    };

    const handleClose = (): void => {
        setSelectedReasons([]);
        setError(null);
        onClose();
    };

    const renderContent = (): React.ReactNode => {
        if (fetchingReasons) {
            return (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            );
        }

        if (error && !fetchingReasons) {
            return <div className="text-red-500 text-center py-4">{error}</div>;
        }

        return (
            <div className="grid gap-4 py-4">
                {holdReasons.map((reason) => (
                    <div key={reason.id} className="flex items-start space-x-3">
                        <Checkbox
                            id={reason.id}
                            checked={selectedReasons.includes(reason.reason_description)}
                            onCheckedChange={() => handleCheckboxChange(reason)}
                        />
                        <Label
                            htmlFor={reason.id}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {reason.reason_description}
                        </Label>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Hold Reasons</DialogTitle>
                </DialogHeader>

                {renderContent()}

                {error && !fetchingReasons && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => void handleConfirm()}
                        disabled={isLoading || selectedReasons.length === 0}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Holding Cart...
                            </>
                        ) : (
                            'Hold Cart'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default HoldCartDialog;