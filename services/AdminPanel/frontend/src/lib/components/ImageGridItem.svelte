<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let { image, isSelected } = $props(); 

    function handleClick() {
        const newSelectionState = !isSelected; 
        dispatch('toggleSelect', {
            filename: image.filename,
            isSelected: newSelectionState 
        });
    }

    function handleImageError(event) {
        event.target.src = 'https://placehold.co/150x150?text=Error';
        event.target.alt = 'Ошибка загрузки изображения';
    }
</script>

<div class="image-item" class:selected={isSelected} on:click={handleClick}>
    <img src={image.url} alt={image.filename || 'Изображение'} on:error={handleImageError} />
    <span>{image.filename || 'Без имени'}</span>
</div>

<style>
    .image-item {
        border: 2px solid transparent;
        border-radius: 5px;
        padding: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--first-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .image-item:hover {
        border-color: var(--blue);
        box-shadow: 0 0 5px rgba(var(--blue-rgb), 0.5);
    }
    .image-item.selected {
        border-color: var(--decor-green);
        background-color: rgba(var(--decor-green-rgb), 0.1);
        box-shadow: 0 0 8px rgba(var(--decor-green-rgb), 0.7);
    }
    .image-item img {
        max-width: 100px;
        max-height: 100px;
        object-fit: contain;
        border-radius: 3px;
        margin-bottom: 0.5rem;
    }
    .image-item span {
        font-size: 0.8rem;
        text-align: center;
        word-break: break-all;
        white-space: normal;
    }
</style>