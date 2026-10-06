import { describe, expect, it } from 'vitest';
import { chatKey, loadMsgs } from '$lib/chatStore';

describe('chatStore', () => {
  it('chatKey berformat chat:<id>', () => {
    expect(chatKey('buyer-1')).toBe('chat:buyer-1');
    expect(chatKey('insp-2')).toBe('chat:insp-2');
  });

  it('loadMsgs kembalikan defaults bila storage kosong/SSR', () => {
    const d = [{ me: false, text: 'halo' }];
    expect(loadMsgs('tak-ada', d)).toEqual(d);
  });
});
