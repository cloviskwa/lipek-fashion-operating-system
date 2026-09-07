'use client';

import {Heart} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Link} from '@/platform/i18n/navigation';
import {useTranslations} from 'next-intl';

interface WishlistIconProps {
    wishlistItemCount: number;
}

export function WishlistIcon({wishlistItemCount}: WishlistIconProps) {
    const t = useTranslations('Navigation');
    return (
        <Button render={<Link href="/wishlist" />} nativeButton={false} variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            {wishlistItemCount > 0 && (
                <span
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItemCount}
                </span>
            )}
            <span className="sr-only">{t('wishlist')}</span>
        </Button>
    );
}
