import {
	createTLStore,
	debounce,
	getSnapshot,
	loadSnapshot,
	Tldraw,
	type TLStoreWithStatus,
} from "tldraw";
import { useEffect, useState } from "react";
import "./index.css";

async function getRemoteSnapshot() {
	const response = await fetch(window.location.href, {
		headers: {
			"content-type": "application/json",
		},
	});
	if (response.status === 204) {
		return null;
	}
	return response.json();
}

async function saveRemoteSnapshot(snapshot: any) {
	await fetch(window.location.href, {
		method: "POST",
		body: JSON.stringify(snapshot),
		headers: {
			"content-type": "application/json",
		},
	});
}

export default function App() {
	const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
		status: "loading",
	});

	useEffect(() => {
		let cancelled = false;
		async function loadRemoteSnapshot() {
			// Get the snapshot
			const snapshot = await getRemoteSnapshot();
			if (cancelled) return;
			if (!snapshot) {
				// No snapshot found
				const newStore = createTLStore();
				setStoreWithStatus({
					connectionStatus: "online",
					store: newStore,
					status: "synced-remote",
				});
				return;
			}

			// Create the store
			const newStore = createTLStore();

			// Load the snapshot
			loadSnapshot(newStore, snapshot);

			// Update the store with status
			setStoreWithStatus({
				connectionStatus: "online",
				store: newStore,
				status: "synced-remote",
			});
		}

		loadRemoteSnapshot();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<Tldraw
				store={storeWithStatus}
				onMount={(editor) => {
					editor.store.listen(
						debounce(async () => {
							const snapshot = getSnapshot(editor.store);
							await saveRemoteSnapshot(snapshot);
						}, 1000),
						{
							scope: "document",
							source: "user",
						},
					);
				}}
			/>
		</div>
	);
}
