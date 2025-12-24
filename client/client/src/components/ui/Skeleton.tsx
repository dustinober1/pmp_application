import { type CSSProperties, type ReactNode } from 'react';

/**
 * Skeleton loader components for loading states
 * Provides visual feedback during data fetching
 * 
 * Addresses Issue #13: Missing Loading States
 */

// =============================================================================
// Base Skeleton Component
// =============================================================================

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    style?: CSSProperties;
    animate?: boolean;
}

export function Skeleton({
    width = '100%',
    height = '1rem',
    borderRadius = '0.375rem',
    className = '',
    style = {},
    animate = true,
}: SkeletonProps) {
    const baseStyle: CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        ...style,
    };

    return (
        <div
            className={`skeleton ${animate ? 'skeleton-pulse' : ''} ${className}`}
            style={baseStyle}
            aria-hidden="true"
        />
    );
}

// =============================================================================
// Skeleton Text (for text content)
// =============================================================================

interface SkeletonTextProps {
    lines?: number;
    lastLineWidth?: string;
    className?: string;
}

export function SkeletonText({
    lines = 3,
    lastLineWidth = '60%',
    className = '',
}: SkeletonTextProps) {
    return (
        <div className={`skeleton-text ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    width={index === lines - 1 ? lastLineWidth : '100%'}
                    height="0.875rem"
                />
            ))}
        </div>
    );
}

// =============================================================================
// Skeleton Card (for card layouts)
// =============================================================================

interface SkeletonCardProps {
    showImage?: boolean;
    imageHeight?: string;
    lines?: number;
    className?: string;
}

export function SkeletonCard({
    showImage = true,
    imageHeight = '12rem',
    lines = 3,
    className = '',
}: SkeletonCardProps) {
    return (
        <div
            className={`skeleton-card ${className}`}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            {showImage && (
                <Skeleton
                    height={imageHeight}
                    borderRadius="0.75rem"
                    style={{ marginBottom: '1rem' }}
                />
            )}
            <Skeleton width="60%" height="1.5rem" style={{ marginBottom: '0.75rem' }} />
            <SkeletonText lines={lines} />
        </div>
    );
}

// =============================================================================
// Skeleton Table Row
// =============================================================================

interface SkeletonTableRowProps {
    columns?: number;
    className?: string;
}

export function SkeletonTableRow({
    columns = 4,
    className = '',
}: SkeletonTableRowProps) {
    return (
        <div
            className={`skeleton-table-row ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '1rem',
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            {Array.from({ length: columns }).map((_, index) => (
                <Skeleton
                    key={index}
                    height="1rem"
                    width={index === 0 ? '80%' : '60%'}
                />
            ))}
        </div>
    );
}

// =============================================================================
// Skeleton List Item
// =============================================================================

interface SkeletonListItemProps {
    showAvatar?: boolean;
    avatarSize?: number;
    lines?: number;
    className?: string;
}

export function SkeletonListItem({
    showAvatar = true,
    avatarSize = 48,
    lines = 2,
    className = '',
}: SkeletonListItemProps) {
    return (
        <div
            className={`skeleton-list-item ${className}`}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
            }}
        >
            {showAvatar && (
                <Skeleton
                    width={avatarSize}
                    height={avatarSize}
                    borderRadius="50%"
                />
            )}
            <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                <SkeletonText lines={lines - 1} lastLineWidth="70%" />
            </div>
        </div>
    );
}

// =============================================================================
// Dashboard Skeleton
// =============================================================================

export function SkeletonDashboard() {
    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Skeleton width="200px" height="2rem" style={{ marginBottom: '0.5rem' }} />
                <Skeleton width="300px" height="1rem" />
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                }}
            >
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Skeleton width="60%" height="0.875rem" style={{ marginBottom: '0.75rem' }} />
                        <Skeleton width="80%" height="2rem" />
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                }}
            >
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
            </div>
        </div>
    );
}

// =============================================================================
// Practice Test Skeleton
// =============================================================================

export function SkeletonPracticeTest() {
    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <Skeleton width="250px" height="2rem" style={{ marginBottom: '2rem' }} />

            {/* Test Cards Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                }}
            >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} showImage={false} lines={2} />
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// Flashcard Skeleton
// =============================================================================

export function SkeletonFlashcard() {
    return (
        <div
            style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '2rem',
            }}
        >
            {/* Card */}
            <div
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1.5rem',
                    padding: '3rem',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Skeleton width="80%" height="1.5rem" style={{ marginBottom: '1rem' }} />
                <SkeletonText lines={4} />
            </div>

            {/* Controls */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginTop: '2rem',
                }}
            >
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} width="60px" height="40px" borderRadius="0.5rem" />
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// Question Skeleton
// =============================================================================

export function SkeletonQuestion() {
    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Progress bar */}
            <Skeleton height="4px" style={{ marginBottom: '2rem' }} />

            {/* Question */}
            <div
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                }}
            >
                <Skeleton width="60px" height="0.875rem" style={{ marginBottom: '1rem' }} />
                <SkeletonText lines={3} />
            </div>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '0.75rem',
                            padding: '1rem 1.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Skeleton height="1rem" width={`${70 + Math.random() * 20}%`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// Wrapper Component with Skeleton or Content
// =============================================================================

interface SkeletonWrapperProps {
    isLoading: boolean;
    skeleton: ReactNode;
    children: ReactNode;
    minLoadingTime?: number;
}

export function SkeletonWrapper({
    isLoading,
    skeleton,
    children,
}: SkeletonWrapperProps) {
    if (isLoading) {
        return <>{skeleton}</>;
    }

    return <>{children}</>;
}

// =============================================================================
// CSS Styles (inject via style tag or CSS file)
// =============================================================================

export const skeletonStyles = `
  @keyframes skeleton-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  .skeleton-pulse {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 75%
    );
    background-size: 200% 100%;
  }

  .skeleton-pulse.skeleton {
    animation: skeleton-pulse 1.5s ease-in-out infinite,
               skeleton-shimmer 2s ease-in-out infinite;
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// Default export for convenience
export default Skeleton;
