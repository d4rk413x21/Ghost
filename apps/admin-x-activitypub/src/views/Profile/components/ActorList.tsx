import APAvatar from '@src/components/global/APAvatar';
import ActivityItem from '@src/components/activities/ActivityItem';
import FollowButton from '@src/components/global/FollowButton';
import React, {useEffect, useRef} from 'react';
import getName from '@src/utils/get-name';
import getUsername from '@src/utils/get-username';
import {Actor} from '@src/api/activitypub';
import {Button, LoadingIndicator} from '@tryghost/shade';
import {List, NoValueLabel} from '@tryghost/admin-x-design-system';
import {handleProfileClick} from '@src/utils/handle-profile-click';
import {useNavigate} from '@tryghost/admin-x-framework';

type ActorListProps = {
    noResultsMessage: string,
    actors: Actor[],
    isLoading: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean,
    isFetchingNextPage: boolean
};

const ActorList: React.FC<ActorListProps> = ({
    noResultsMessage,
    actors,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
}) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const navigate = useNavigate();

    return (
        <div className='pt-3'>
            {
                hasNextPage === false && actors.length === 0 ? (
                    <NoValueLabel icon='user-add'>
                        {noResultsMessage}
                    </NoValueLabel>
                ) : (
                    <List>
                        {actors.map(({actor, isFollowing, blockedByMe, domainBlockedByMe}) => {
                            return (
                                <React.Fragment key={actor.id}>
                                    <ActivityItem key={actor.id}
                                        onClick={() => {
                                            handleProfileClick(actor, navigate);
                                        }}
                                    >
                                        <APAvatar author={actor} />
                                        <div>
                                            <div className='text-gray-600 break-anywhere'>
                                                <span className='mr-1 line-clamp-1 font-bold text-black dark:text-white'>{getName(actor)}</span>
                                                <div className='line-clamp-1 text-sm'>{actor.handle || getUsername(actor)}</div>
                                            </div>
                                        </div>
                                        {blockedByMe || domainBlockedByMe ?
                                            <Button className='pointer-events-none ml-auto min-w-[90px]' variant='destructive'>Blocked</Button> :
                                            <FollowButton
                                                className='ml-auto'
                                                following={isFollowing}
                                                handle={actor.handle || getUsername(actor)}
                                                type='secondary'
                                            />
                                        }
                                    </ActivityItem>
                                </React.Fragment>
                            );
                        })}
                    </List>
                )
            }
            <div ref={loadMoreRef} className='h-1'></div>
            {
                (isFetchingNextPage || isLoading) && (
                    <div className='mt-6 flex flex-col items-center justify-center space-y-4 text-center'>
                        <LoadingIndicator size='md' />
                    </div>
                )
            }
        </div>
    );
};

export default ActorList;
